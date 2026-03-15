import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Clean reset — clears all transactional data but keeps organizations intact.
 * Use this when you want to manually test from an empty network.
 *
 * Usage: npm run db:clean
 */
async function main() {
  // Delete in order: matches depend on posts, feed events are independent
  await prisma.feedEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.donorOffer.deleteMany();
  await prisma.post.deleteMany();

  // Verify orgs still exist
  const orgCount = await prisma.organization.count();

  console.log("\n=== DATABASE CLEANED ===");
  console.log("Deleted: all posts, matches, donor offers, feed events");
  console.log(`Kept: ${orgCount} organizations`);
  console.log("\nThe network is empty. Log in as any org to start posting.");
  console.log("\nOrg codes:");
  console.log("  hou-naz   — House of Nazareth");
  console.log("  ymca-gm   — YMCA Greater Moncton");
  console.log("  cross-wo  — Crossroads for Women");
  console.log("  harv-atl  — Harvest House Atlantic");
  console.log("  rise-tid  — Rising Tide");
  console.log("  salvus    — Salvus");
  console.log("  ywca-mon  — YWCA Moncton");
  console.log("  jhs-senb  — John Howard Society");
  console.log("  hdc-monc  — Human Development Council");
  console.log("  youth-ij  — Youth Impact Jeunesse");
  console.log("\nCoordinator code: gmhsc-coord");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
