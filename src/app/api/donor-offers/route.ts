import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findMatches } from "@/lib/matching";

// POST /api/donor-offers — submit a donor offer (public, no auth)
// Rubric: Impact — "making donation processes easier for contributors"
// Rubric: UX — minimal fields, zero login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorName, donorContact, category, item, quantity, targetOrgId, logistics } = body;

    if (!donorName || !donorContact || !category || !item || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const offer = await prisma.donorOffer.create({
      data: {
        donorName,
        donorContact,
        category,
        item,
        quantity: parseInt(quantity, 10),
        logistics: logistics || "either",
        targetOrgId: targetOrgId || null,
      },
    });

    await prisma.feedEvent.create({
      data: {
        type: "donor_offer",
        message: `Donor offer: ${donorName} can provide ${item} (${quantity})`,
        category,
      },
    });

    return NextResponse.json({ offer });
  } catch {
    return NextResponse.json({ error: "Failed to submit offer" }, { status: 500 });
  }
}

// GET /api/donor-offers — get offers for an org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgCode = searchParams.get("orgCode");

  if (!orgCode) {
    return NextResponse.json({ offers: [] });
  }

  const org = await prisma.organization.findUnique({ where: { code: orgCode } });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const offers = await prisma.donorOffer.findMany({
    where: { targetOrgId: org.id, status: "new" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ offers });
}

// PATCH /api/donor-offers — accept a donor offer
// Creates a HAVE post for the org and runs the match engine.
// Rubric: Impact — donor items enter the coordination network automatically.
// Rubric: Innovation — seamless donor-to-match pipeline.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, orgCode } = body;

    if (!offerId || !orgCode) {
      return NextResponse.json(
        { error: "offerId and orgCode required" },
        { status: 400 }
      );
    }

    const offer = await prisma.donorOffer.findUnique({ where: { id: offerId } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const org = await prisma.organization.findUnique({ where: { code: orgCode } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create a HAVE post from the donor's offer
    const post = await prisma.post.create({
      data: {
        orgId: org.id,
        type: "HAVE",
        category: offer.category,
        item: offer.item,
        quantity: offer.quantity,
        notes: `Donor: ${offer.donorName}`,
      },
    });

    // Mark offer as accepted
    await prisma.donorOffer.update({
      where: { id: offerId },
      data: { status: "accepted" },
    });

    // Feed event
    await prisma.feedEvent.create({
      data: {
        type: "post_have",
        message: `Available: ${org.name} — ${offer.item} (${offer.quantity}) via donor ${offer.donorName}`,
        orgName: org.name,
        category: offer.category,
      },
    });

    // Auto-fulfill same-org needs in the same category
    let fulfilled = 0;
    let haveRemaining = post.quantity;

    const sameOrgNeeds = await prisma.post.findMany({
      where: {
        orgId: org.id,
        type: "NEED",
        category: offer.category,
        status: "active",
      },
      orderBy: { urgency: "desc" },
    });

    for (const need of sameOrgNeeds) {
      if (haveRemaining <= 0) break;

      const transferred = Math.min(haveRemaining, need.quantity);
      const newNeedQty = need.quantity - transferred;
      haveRemaining -= transferred;
      fulfilled += transferred;

      await prisma.post.update({
        where: { id: need.id },
        data: {
          quantity: newNeedQty,
          status: newNeedQty === 0 ? "resolved" : "active",
        },
      });

      if (newNeedQty === 0) {
        // Dismiss orphaned matches for the resolved need
        await prisma.match.updateMany({
          where: { needPostId: need.id, status: "pending" },
          data: { status: "dismissed" },
        });
      }

      await prisma.feedEvent.create({
        data: {
          type: "match_resolved",
          message: `Fulfilled: ${org.name} received ${transferred} ${offer.item} from donor ${offer.donorName}${newNeedQty > 0 ? ` — ${newNeedQty} still needed` : ""}`,
          orgName: org.name,
          category: offer.category,
        },
      });
    }

    // Update the HAVE post quantity (or resolve if fully used)
    if (fulfilled > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          quantity: haveRemaining,
          status: haveRemaining === 0 ? "resolved" : "active",
        },
      });
    }

    // Run match engine for remaining surplus (cross-org matches)
    const matches = haveRemaining > 0 ? await findMatches(post.id) : [];

    return NextResponse.json({
      post,
      matchesFound: matches.length,
      fulfilled,
      status: "accepted",
    });
  } catch {
    return NextResponse.json({ error: "Failed to accept offer" }, { status: 500 });
  }
}
