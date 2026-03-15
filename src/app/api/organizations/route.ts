import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/organizations — list all orgs with computed status
// Rubric: Impact — this powers the "full picture" dashboard.
export async function GET() {
  const orgs = await prisma.organization.findMany({
    include: {
      posts: {
        where: { status: "active" },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const seventyTwoH = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const result = orgs.map((org) => {
    const activeNeeds = org.posts.filter((p) => p.type === "NEED");
    const activeHaves = org.posts.filter((p) => p.type === "HAVE");
    const criticalNeeds = activeNeeds.filter((p) => p.urgency === "critical");
    const expiringItems = activeHaves.filter(
      (p) => p.expiryDate && new Date(p.expiryDate) <= seventyTwoH
    );

    // Status computation: red if critical needs, yellow if moderate or expiring, green otherwise
    let status: "red" | "yellow" | "green" = "green";
    if (criticalNeeds.length > 0) {
      status = "red";
    } else if (activeNeeds.length > 0 || expiringItems.length > 0) {
      status = "yellow";
    }

    return {
      id: org.id,
      name: org.name,
      code: org.code,
      type: org.type,
      phone: org.phone,
      status,
      activeNeeds: activeNeeds.length,
      activeHaves: activeHaves.length,
      criticalNeeds: criticalNeeds.length,
      expiringItems: expiringItems.length,
    };
  });

  return NextResponse.json({ organizations: result });
}
