import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Demo seed data — platform feels alive, but key coordination actions are left for live demo.
 *
 * Seeded: organizations, NEED posts, HAVE posts, lightweight feed history.
 * NOT seeded: matches, donor offers, transfers, fulfillment — these are demo'd live.
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

  // Calculate dates relative to now for realistic expiry
  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  // === NEED POSTS ===
  const needs = await Promise.all([
    // House of Nazareth — 3 needs, 2 critical (RED status)
    prisma.post.create({
      data: {
        orgId: houseNaz.id,
        type: "NEED",
        category: "Winter Clothing",
        item: "Winter coats (kids sizes)",
        quantity: 10,
        urgency: "critical",
        createdAt: hoursAgo(5),
      },
    }),
    prisma.post.create({
      data: {
        orgId: houseNaz.id,
        type: "NEED",
        category: "Bedding & Linens",
        item: "Warm blankets",
        quantity: 15,
        urgency: "critical",
        createdAt: hoursAgo(8),
      },
    }),
    prisma.post.create({
      data: {
        orgId: houseNaz.id,
        type: "NEED",
        category: "Food — Non-Perishable",
        item: "Canned soup",
        quantity: 30,
        urgency: "moderate",
        createdAt: hoursAgo(12),
      },
    }),

    // Rising Tide — 2 critical needs (RED status)
    prisma.post.create({
      data: {
        orgId: risingTide.id,
        type: "NEED",
        category: "Hygiene Products",
        item: "Hygiene kits",
        quantity: 25,
        urgency: "critical",
        createdAt: hoursAgo(6),
      },
    }),
    prisma.post.create({
      data: {
        orgId: risingTide.id,
        type: "NEED",
        category: "General Clothing",
        item: "Socks and underwear",
        quantity: 40,
        urgency: "critical",
        createdAt: hoursAgo(10),
      },
    }),

    // Crossroads — moderate need (YELLOW status from expiry)
    prisma.post.create({
      data: {
        orgId: crossroads.id,
        type: "NEED",
        category: "Baby & Children",
        item: "Diapers (size 3-4)",
        quantity: 50,
        urgency: "moderate",
        createdAt: hoursAgo(4),
      },
    }),

    // YWCA — 2 moderate needs (YELLOW status)
    prisma.post.create({
      data: {
        orgId: ywca.id,
        type: "NEED",
        category: "Kitchen & Household",
        item: "Dish soap and sponges",
        quantity: 20,
        urgency: "moderate",
        createdAt: hoursAgo(3),
      },
    }),
    prisma.post.create({
      data: {
        orgId: ywca.id,
        type: "NEED",
        category: "Food — Perishable",
        item: "Fresh fruit",
        quantity: 15,
        urgency: "moderate",
        createdAt: hoursAgo(7),
      },
    }),

    // HDC — moderate need
    prisma.post.create({
      data: {
        orgId: hdc.id,
        type: "NEED",
        category: "Personal Care",
        item: "Toothbrushes",
        quantity: 100,
        urgency: "moderate",
        createdAt: hoursAgo(2),
      },
    }),

    // Youth Impact — critical need (RED)
    prisma.post.create({
      data: {
        orgId: youthImpact.id,
        type: "NEED",
        category: "Winter Clothing",
        item: "Winter boots (youth sizes)",
        quantity: 12,
        urgency: "critical",
        createdAt: hoursAgo(9),
      },
    }),

    // Unmatched needs — no HAVE exists in these categories yet.
    // Creates a realistic ~83% match rate instead of a suspicious 100%.
    prisma.post.create({
      data: {
        orgId: houseNaz.id,
        type: "NEED",
        category: "Other",
        item: "Backpacks",
        quantity: 15,
        urgency: "moderate",
        createdAt: hoursAgo(6),
      },
    }),
    prisma.post.create({
      data: {
        orgId: risingTide.id,
        type: "NEED",
        category: "Other",
        item: "Sleeping bags",
        quantity: 8,
        urgency: "critical",
        createdAt: hoursAgo(4),
      },
    }),
  ]);

  console.log(`Created ${needs.length} need posts`);

  // === HAVE POSTS (Surplus) ===
  const haves = await Promise.all([
    // YMCA — well stocked (GREEN)
    prisma.post.create({
      data: {
        orgId: ymca.id,
        type: "HAVE",
        category: "Winter Clothing",
        item: "Winter coats (mixed sizes)",
        quantity: 30,
        condition: "Gently used",
        createdAt: hoursAgo(24),
      },
    }),
    prisma.post.create({
      data: {
        orgId: ymca.id,
        type: "HAVE",
        category: "General Clothing",
        item: "Socks (new, packaged)",
        quantity: 60,
        condition: "New in box",
        createdAt: hoursAgo(18),
      },
    }),
    prisma.post.create({
      data: {
        orgId: ymca.id,
        type: "HAVE",
        category: "Bedding & Linens",
        item: "Fleece blankets",
        quantity: 20,
        condition: "Like new",
        imageUrl: "https://example.com/photos/fleece-blankets.jpg",
        createdAt: hoursAgo(20),
      },
    }),
    prisma.post.create({
      data: {
        orgId: ymca.id,
        type: "HAVE",
        category: "Personal Care",
        item: "Toothbrush packs",
        quantity: 50,
        createdAt: hoursAgo(15),
      },
    }),

    // Crossroads — has items, some EXPIRING (YELLOW from expiry)
    prisma.post.create({
      data: {
        orgId: crossroads.id,
        type: "HAVE",
        category: "Hygiene Products",
        item: "Hygiene kits",
        quantity: 45,
        expiryDate: hoursFromNow(48), // Expires in 48h — DEMO MOMENT
        createdAt: hoursAgo(72),
      },
    }),
    prisma.post.create({
      data: {
        orgId: crossroads.id,
        type: "HAVE",
        category: "Food — Perishable",
        item: "Yogurt cups",
        quantity: 30,
        expiryDate: hoursFromNow(24), // Expires in 24h — URGENT
        createdAt: hoursAgo(48),
      },
    }),

    // Harvest House — well stocked (GREEN)
    prisma.post.create({
      data: {
        orgId: harvest.id,
        type: "HAVE",
        category: "Food — Non-Perishable",
        item: "Canned soup",
        quantity: 80,
        createdAt: hoursAgo(30),
      },
    }),
    prisma.post.create({
      data: {
        orgId: harvest.id,
        type: "HAVE",
        category: "Bedding & Linens",
        item: "Pillows",
        quantity: 25,
        createdAt: hoursAgo(25),
      },
    }),
    prisma.post.create({
      data: {
        orgId: harvest.id,
        type: "HAVE",
        category: "Kitchen & Household",
        item: "Cleaning supplies",
        quantity: 15,
        createdAt: hoursAgo(14),
      },
    }),

    // Salvus — has diapers (GREEN)
    prisma.post.create({
      data: {
        orgId: salvus.id,
        type: "HAVE",
        category: "Baby & Children",
        item: "Diapers (size 3-5)",
        quantity: 30,
        condition: "New in box",
        createdAt: hoursAgo(16),
      },
    }),

    // JHS — has some clothing (GREEN)
    prisma.post.create({
      data: {
        orgId: jhs.id,
        type: "HAVE",
        category: "General Clothing",
        item: "Men's jeans",
        quantity: 20,
        createdAt: hoursAgo(22),
      },
    }),
    prisma.post.create({
      data: {
        orgId: jhs.id,
        type: "HAVE",
        category: "Winter Clothing",
        item: "Winter boots (men's)",
        quantity: 8,
        createdAt: hoursAgo(19),
      },
    }),
  ]);

  console.log(`Created ${haves.length} have posts`);

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
  console.log(`Need posts: ${needs.length} (5 critical, 7 moderate)`);
  console.log(`Have posts: ${haves.length} (2 with expiry dates)`);
  console.log("Matches: 0 (created live during demo)");
  console.log(`Feed events: ${feedEvents.length} (post_need + post_have only)`);
  console.log("Donor offers: 0 (created live during demo)");
  console.log("\nDemo org codes:");
  console.log("  hou-naz   — House of Nazareth (shelter, critical needs)");
  console.log("  ymca-gm   — YMCA Greater Moncton (outreach, well stocked)");
  console.log("  cross-wo  — Crossroads for Women (shelter, expiring items)");
  console.log("  harv-atl  — Harvest House Atlantic (shelter, surplus)");
  console.log("  rise-tid  — Rising Tide (service, critical needs)");
  console.log("  salvus    — Salvus (service, surplus)");
  console.log("  ywca-mon  — YWCA Moncton (shelter, moderate needs)");
  console.log("  jhs-senb  — John Howard Society (service, surplus)");
  console.log("  hdc-monc  — Human Development Council (coordinator)");
  console.log("  youth-ij  — Youth Impact Jeunesse (service, critical need)");
  console.log("\nLive demo actions to perform:");
  console.log("  1. Post a HAVE or NEED → watch match appear");
  console.log("  2. Donor board → submit offer → staff accepts");
  console.log("  3. Transfer request → accept → need disappears");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
