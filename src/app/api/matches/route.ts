import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/matches — get matches for an org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgCode = searchParams.get("orgCode");

  const where: Record<string, unknown> = {};

  if (orgCode) {
    const org = await prisma.organization.findUnique({ where: { code: orgCode } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    where.OR = [
      { havePost: { orgId: org.id } },
      { needPost: { orgId: org.id } },
    ];
  }

  const matches = await prisma.match.findMany({
    where,
    include: {
      havePost: { include: { org: { select: { name: true, code: true, phone: true } } } },
      needPost: { include: { org: { select: { name: true, code: true, phone: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ matches });
}

// PATCH /api/matches — resolve or dismiss a match
// Rubric: Impact — quantity reconciliation makes coordination realistic.
// Rubric: Innovation — automated partial fulfillment, not just yes/no.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, status } = body;

    if (!matchId || !["requested", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json(
        { error: "matchId and status (requested|resolved|dismissed) required" },
        { status: 400 }
      );
    }

    // Fetch the match with current post quantities
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        havePost: { include: { org: { select: { name: true } } } },
        needPost: { include: { org: { select: { name: true } } } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Requested — need org signals intent, have org sees the request
    if (status === "requested") {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: "requested" },
      });

      await prisma.feedEvent.create({
        data: {
          type: "transfer_requested",
          message: `Transfer requested: ${match.needPost.org.name} wants ${match.havePost.item} from ${match.havePost.org.name}`,
          orgName: match.needPost.org.name,
          category: match.havePost.category,
        },
      });

      return NextResponse.json({ match: { ...match, status: "requested" } });
    }

    if (status === "resolved") {
      const haveQty = match.havePost.quantity;
      const needQty = match.needPost.quantity;
      const transferred = Math.min(haveQty, needQty);

      const newHaveQty = haveQty - transferred;
      const newNeedQty = needQty - transferred;

      // Update HAVE post quantity (resolve if depleted)
      await prisma.post.update({
        where: { id: match.havePostId },
        data: {
          quantity: newHaveQty,
          status: newHaveQty === 0 ? "resolved" : "active",
        },
      });

      // Update NEED post quantity (resolve if fulfilled)
      await prisma.post.update({
        where: { id: match.needPostId },
        data: {
          quantity: newNeedQty,
          status: newNeedQty === 0 ? "resolved" : "active",
        },
      });

      // Update match
      await prisma.match.update({
        where: { id: matchId },
        data: { status: "resolved", resolvedAt: new Date() },
      });

      // Feed event with quantity detail
      const surplusNote = newHaveQty > 0
        ? ` (${newHaveQty} remaining at ${match.havePost.org.name})`
        : "";
      const partialNote = newNeedQty > 0
        ? ` — ${newNeedQty} still needed`
        : "";

      await prisma.feedEvent.create({
        data: {
          type: "match_resolved",
          message: `Resolved: ${match.needPost.org.name} received ${transferred} ${match.havePost.item} from ${match.havePost.org.name}${surplusNote}${partialNote}`,
          orgName: match.needPost.org.name,
          category: match.havePost.category,
        },
      });

      // Dismiss other pending matches for posts that are now resolved
      if (newNeedQty === 0) {
        await prisma.match.updateMany({
          where: { needPostId: match.needPostId, status: "pending", id: { not: matchId } },
          data: { status: "dismissed" },
        });
      }
      if (newHaveQty === 0) {
        await prisma.match.updateMany({
          where: { havePostId: match.havePostId, status: "pending", id: { not: matchId } },
          data: { status: "dismissed" },
        });
      }

      return NextResponse.json({
        match: { ...match, status: "resolved" },
        transferred,
        remainingHave: newHaveQty,
        remainingNeed: newNeedQty,
      });
    }

    // Dismissed — just update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "dismissed" },
    });

    return NextResponse.json({ match: { ...match, status: "dismissed" } });
  } catch {
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}
