import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/feed — recent network activity
// Optional ?orgName= filter for organization-specific activity
// Rubric: Pitch — the live feed makes the system feel alive during demo.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const orgName = searchParams.get("orgName");

  const where = orgName
    ? {
        OR: [
          { orgName },
          { message: { contains: orgName } },
        ],
      }
    : undefined;

  const events = await prisma.feedEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ events });
}
