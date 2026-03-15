import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Demo seed data — platform feels alive, but key coordination actions are left for live demo.
 *
 * Seeded: organizations, lightweight feed history.
 * NOT seeded: posts, matches, donor offers — all created live during demo.
 */
async function main() {
  // Clear existing data
  await prisma.feedEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.donorOffer.deleteMany();
  await prisma.post.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Cleared existing data");

  // Create organizations — real GMHSC member names
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: "House of Nazareth",
        code: "hou-naz",
        type: "shelter",
        phone: "506-555-0101",
      },
    }),
    prisma.organization.create({
      data: {
        name: "YMCA Greater Moncton",
        code: "ymca-gm",
        type: "outreach",
        phone: "506-555-0102",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Crossroads for Women",
        code: "cross-wo",
        type: "shelter",
        phone: "506-555-0103",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Harvest House Atlantic",
        code: "harv-atl",
        type: "shelter",
        phone: "506-555-0104",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Rising Tide",
        code: "rise-tid",
        type: "service",
        phone: "506-555-0105",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Salvus",
        code: "salvus",
        type: "service",
        phone: "506-555-0106",
      },
    }),
    prisma.organization.create({
      data: {
        name: "YWCA Moncton",
        code: "ywca-mon",
        type: "shelter",
        phone: "506-555-0107",
      },
    }),
    prisma.organization.create({
      data: {
        name: "John Howard Society",
        code: "jhs-senb",
        type: "service",
        phone: "506-555-0108",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Human Development Council",
        code: "hdc-monc",
        type: "coordinator",
        phone: "506-555-0109",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Youth Impact Jeunesse",
        code: "youth-ij",
        type: "service",
        phone: "506-555-0110",
      },
    }),
  ]);

  const [
    houseNaz,
    ymca,
    crossroads,
    harvest,
    risingTide,
    salvus,
    ywca,
    jhs,
    hdc,
    youthImpact,
  ] = orgs;

  console.log(`Created ${orgs.length} organizations`);

  // No NEED or HAVE posts — staff workspaces start clean for live demo

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  // === FEED EVENTS ===
  // Lightweight passive history only — no matches, no transfers, no donor fulfillment
  const feedEvents = [
    {
      type: "post_need",
      message: "Need: House of Nazareth — Winter coats, kids sizes (10) (CRITICAL)",
      orgName: "House of Nazareth",
      category: "Winter Clothing",
      createdAt: hoursAgo(5),
    },
    {
      type: "post_need",
      message: "Need: Rising Tide — Hygiene kits (25) (CRITICAL)",
      orgName: "Rising Tide",
      category: "Hygiene Products",
      createdAt: hoursAgo(6),
    },
    {
      type: "post_need",
      message: "Need: Rising Tide — Socks and underwear (40) (CRITICAL)",
      orgName: "Rising Tide",
      category: "General Clothing",
      createdAt: hoursAgo(10),
    },
    {
      type: "post_need",
      message: "Need: Crossroads for Women — Diapers, size 3-4 (50)",
      orgName: "Crossroads for Women",
      category: "Baby & Children",
      createdAt: hoursAgo(4),
    },
    {
      type: "post_have",
      message: "Available: YMCA Greater Moncton — Winter coats, mixed sizes (30)",
      orgName: "YMCA Greater Moncton",
      category: "Winter Clothing",
      createdAt: hoursAgo(24),
    },
    {
      type: "post_have",
      message: "Available: YMCA Greater Moncton — Socks, new packaged (60)",
      orgName: "YMCA Greater Moncton",
      category: "General Clothing",
      createdAt: hoursAgo(18),
    },
    {
      type: "post_have",
      message: "Available: Harvest House Atlantic — Canned soup (80)",
      orgName: "Harvest House Atlantic",
      category: "Food — Non-Perishable",
      createdAt: hoursAgo(30),
    },
    {
      type: "post_have",
      message: "Available: Crossroads for Women — Hygiene kits (45)",
      orgName: "Crossroads for Women",
      category: "Hygiene Products",
      createdAt: hoursAgo(72),
    },
    {
      type: "post_have",
      message: "Available: Salvus — Diapers, size 3-5 (30)",
      orgName: "Salvus",
      category: "Baby & Children",
      createdAt: hoursAgo(16),
    },
    {
      type: "post_need",
      message: "Need: YWCA Moncton — Dish soap and sponges (20)",
      orgName: "YWCA Moncton",
      category: "Kitchen & Household",
      createdAt: hoursAgo(3),
    },
  ];

  for (const event of feedEvents) {
    await prisma.feedEvent.create({ data: event });
  }

  console.log(`Created ${feedEvents.length} feed events`);

  // No matches, no donor offers, no transfers — these are created live during demo

  // Summary
  console.log("\n=== SEED COMPLETE ===");
  console.log("Organizations: 10");
  console.log("Need posts: 0 (created live during demo)");
  console.log("Have posts: 0 (created live during demo)");
  console.log("Matches: 0 (created live during demo)");
  console.log(`Feed events: ${feedEvents.length} (background activity history)`);
  console.log("Donor offers: 0 (created live during demo)");
  console.log("\nDemo org codes:");
  console.log("  hou-naz   — House of Nazareth (shelter)");
  console.log("  ymca-gm   — YMCA Greater Moncton (outreach)");
  console.log("  cross-wo  — Crossroads for Women (shelter)");
  console.log("  harv-atl  — Harvest House Atlantic (shelter)");
  console.log("  rise-tid  — Rising Tide (service)");
  console.log("  salvus    — Salvus (service)");
  console.log("  ywca-mon  — YWCA Moncton (shelter)");
  console.log("  jhs-senb  — John Howard Society (service)");
  console.log("  hdc-monc  — Human Development Council (coordinator)");
  console.log("  youth-ij  — Youth Impact Jeunesse (service)");
  console.log("\nStaff workspaces start clean — all posts created live during demo");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
