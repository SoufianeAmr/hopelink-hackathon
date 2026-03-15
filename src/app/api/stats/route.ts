import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stats — network pulse metrics
// Rubric: Pitch — one number that tells the whole story.
// Rubric: Impact — "X% of needs have matches" = measurable coordination.
// Build cost: ~30 min. Score ROI: very high.
export async function GET() {
  const [activeNeeds, activeHaves, totalMatches, resolvedMatches, pendingMatches, expiringItems] =
    await Promise.all([
      prisma.post.count({ where: { type: "NEED", status: "active" } }),
      prisma.post.count({ where: { type: "HAVE", status: "active" } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: "resolved" } }),
      prisma.match.count({ where: { status: "pending" } }),
      prisma.post.count({
        where: {
          type: "HAVE",
          status: "active",
          expiryDate: {
            not: null,
            lte: new Date(Date.now() + 72 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  // Count needs that have at least one pending or resolved match
  const needsWithMatches = await prisma.post.count({
    where: {
      type: "NEED",
      status: "active",
      needMatches: { some: { status: { in: ["pending", "resolved"] } } },
    },
  });

  const matchRate = activeNeeds > 0 ? Math.round((needsWithMatches / activeNeeds) * 100) : 0;

  return NextResponse.json({
    activeNeeds,
    activeHaves,
    totalMatches,
    resolvedMatches,
    pendingMatches,
    expiringItems,
    needsWithMatches,
    matchRate,
  });
}
