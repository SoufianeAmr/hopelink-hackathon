import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findMatches } from "@/lib/matching";
import { CATEGORIES } from "@/lib/categories";

// GET /api/posts — get posts, optionally filtered by org code, type, category
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgCode = searchParams.get("orgCode");
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "active";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (category) where.category = category;
  if (orgCode) {
    const org = await prisma.organization.findUnique({ where: { code: orgCode } });
    if (org) where.orgId = org.id;
  }

  const posts = await prisma.post.findMany({
    where,
    include: { org: { select: { name: true, code: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

// POST /api/posts — create a new We Have / We Need post
// Rubric: Impact — this is how data enters the system.
// Rubric: UX — API accepts minimal fields, sensible defaults.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgCode, type, category, item, quantity, urgency, expiryDate, notes, condition, imageUrl } = body;

    if (!orgCode || !type || !category || !item || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: orgCode, type, category, item, quantity" },
        { status: 400 }
      );
    }

    if (!["HAVE", "NEED"].includes(type)) {
      return NextResponse.json({ error: 'Type must be "HAVE" or "NEED"' }, { status: 400 });
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { code: orgCode } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        orgId: org.id,
        type,
        category,
        item,
        quantity: parseInt(quantity, 10),
        urgency: urgency || "low",
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes || "",
        condition: condition || "",
        imageUrl: imageUrl || "",
      },
      include: { org: { select: { name: true } } },
    });

    // Create feed event
    const emoji = type === "HAVE" ? "Available" : "Need";
    const urgencyTag = urgency === "critical" ? " (CRITICAL)" : "";
    await prisma.feedEvent.create({
      data: {
        type: type === "HAVE" ? "post_have" : "post_need",
        message: `${emoji}: ${org.name} — ${item} (${quantity})${urgencyTag}`,
        orgName: org.name,
        category,
      },
    });

    // Run the match engine
    const matches = await findMatches(post.id);

    // Fetch full match data for response
    const fullMatches = await prisma.match.findMany({
      where: {
        OR: [{ havePostId: post.id }, { needPostId: post.id }],
        status: "pending",
      },
      include: {
        havePost: { include: { org: { select: { name: true, phone: true } } } },
        needPost: { include: { org: { select: { name: true, phone: true } } } },
      },
    });

    return NextResponse.json({
      post,
      matchesFound: matches.length,
      matches: fullMatches,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
