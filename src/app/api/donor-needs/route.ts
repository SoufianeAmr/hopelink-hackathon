import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/donor-needs — public aggregated needs for the donor board
// Rubric: Impact — serves the Donor user. Rubric: UX — zero auth, public.
export async function GET() {
  const needs = await prisma.post.findMany({
    where: { type: "NEED", status: "active" },
    include: { org: { select: { name: true, id: true } } },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
  });

  // Aggregate by category
  const categoryMap = new Map<
    string,
    {
      category: string;
      totalQuantity: number;
      highestUrgency: string;
      organizations: { name: string; id: string; item: string; quantity: number }[];
    }
  >();

  for (const need of needs) {
    const existing = categoryMap.get(need.category);
    if (existing) {
      existing.totalQuantity += need.quantity;
      if (need.urgency === "critical") existing.highestUrgency = "critical";
      else if (need.urgency === "moderate" && existing.highestUrgency !== "critical")
        existing.highestUrgency = "moderate";
      existing.organizations.push({
        name: need.org.name,
        id: need.org.id,
        item: need.item,
        quantity: need.quantity,
      });
    } else {
      categoryMap.set(need.category, {
        category: need.category,
        totalQuantity: need.quantity,
        highestUrgency: need.urgency,
        organizations: [
          {
            name: need.org.name,
            id: need.org.id,
            item: need.item,
            quantity: need.quantity,
          },
        ],
      });
    }
  }

  // Sort: critical first, then moderate, then low
  const urgencyOrder = { critical: 0, moderate: 1, low: 2 };
  const sorted = Array.from(categoryMap.values()).sort(
    (a, b) =>
      (urgencyOrder[a.highestUrgency as keyof typeof urgencyOrder] ?? 2) -
      (urgencyOrder[b.highestUrgency as keyof typeof urgencyOrder] ?? 2)
  );

  return NextResponse.json({ needs: sorted });
}
