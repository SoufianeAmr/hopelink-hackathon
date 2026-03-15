# HopeLink

**See needs. Match resources. Reduce waste.**

Real-time donation coordination for the Greater Moncton Homelessness Steering Committee (GMHSC) network.

Hack4Change 2026 | March 13-15 | Venn Innovation, Moncton

## The Problem

28 organizations in the GMHSC network coordinate donated goods through phone calls, texts, and emails. There is no shared visibility into what's available, what's needed, or what's expiring across the network.

The result: some shelters are overstocked while others face shortages. Time-sensitive items expire before they can be redistributed. Coordination requires significant manual effort from already-stretched staff.

~550 people experiencing chronic homelessness in Greater Moncton depend on this network working efficiently.

## Our Solution

HopeLink is a lightweight coordination hub that gives every GMHSC organization instant visibility into needs, available items, and urgent shortages across the entire network — with smart matching that automatically connects surplus to shortage before items go to waste.

HopeLink does not replace communication between organizations. It tells them **who to call and why**.

## Key Features

### Role-Based Entry
Three clear entry points from the landing page: Organization Staff, Coordinator, and Donor. Each role gets exactly the view and tools they need — no confusion, no wrong turns.

### Coordinator Overview (Read-Only)
Real-time overview of all GMHSC organizations. Color-coded status (green/yellow/red) shows network health at a glance. Coordinators observe and monitor — organizations coordinate directly with each other. This mirrors how the GMHSC network actually operates.

### Report Export (CSV & PDF)
Coordinators can export network reports with one click. Reports include an executive summary, network metrics, critical needs breakdown, items nearing expiry, and a full organization status table. CSV opens cleanly in Excel, Google Sheets, and LibreOffice. PDF generates a print-ready formatted summary for GMHSC board meetings and grant applications. Both exports are generated client-side with zero external dependencies.

### Quick Post (We Have / We Need)
Two-button interface for shelter staff to post available items or needs. Category dropdown, quantity, urgency level, optional condition and photo URL. Designed for a shelter worker at midnight on their phone. Under 30 seconds to complete.

### Smart Match Engine
When a need is posted, HopeLink automatically finds matching available items from other organizations. Matches are prioritized by urgency (critical needs first) and expiry (items expiring soonest matched first). Deterministic category-based matching — no AI, no black boxes.

### Organization-to-Organization Transfer Requests
When HopeLink surfaces a match, the organization with the need can request a transfer. The organization with the surplus sees the request with contact details, coordinates directly, and confirms the transfer in the system. No central approval. No coordinator gatekeeping. Organizations decide for themselves — HopeLink just makes the connection visible.

### Quantity Reconciliation
When a transfer is confirmed, the system calculates it automatically: `transferred = min(surplus, need)`. Post quantities are updated in real time — if YMCA has 30 coats and a shelter needs 10, the transfer moves 10 and YMCA's listing drops to 20, remaining available for other matches. Posts resolve automatically when their quantity reaches zero, and orphaned pending matches are dismissed.

### Expiry Countdown
Items with expiry dates show visual countdown badges. Items within 72 hours of expiry are flagged and auto-matched. Prevents waste by surfacing time-sensitive redistribution opportunities.

### Public Donor Board
Zero-login page showing current network needs, aggregated by category and urgency. Donors can submit an "I Can Help" offer with a simple form — including whether they can pick up, deliver, or either. No account required.

### Live Network Feed
Real-time activity feed showing posts, matches, resolutions, and expiry alerts as they happen across the network.

## How It Works

**For a shelter worker (30 seconds):**
1. Open HopeLink on any device → enter your organization code
2. Tap "We Need" → select category, item, quantity, urgency → Post
3. HopeLink instantly searches the network for a match and shows results
4. If a match exists, tap "Request Transfer" → the other org sees the request with your contact info
5. After coordinating directly, the providing org confirms the transfer → quantities update automatically

**For a coordinator (3 seconds):**
1. Open HopeLink → select "Coordinator" → enter coordinator code
2. See all 28 organizations color-coded: red = critical needs, yellow = active needs, green = well stocked
3. Scroll to the live feed to see matches, posts, and expiry alerts in real time
4. Export CSV or PDF reports for board meetings and grant applications
5. Coordinators observe — organizations coordinate directly

**For a donor (10 seconds):**
1. Visit the public Donor Board — no login needed
2. See what the network needs right now, sorted by urgency
3. Tap "I Can Help" → fill in details, select pickup/delivery → done

**Behind the scenes:**
- When a NEED matches a HAVE in the same category from a different organization, HopeLink creates a match and notifies both sides
- Confirming a transfer automatically adjusts quantities on both posts — partial fulfillment is handled without manual math
- Accepted donor offers create surplus posts and run the match engine immediately
- Items approaching expiry are automatically flagged and matched before they go to waste
- All activity appears in the live network feed

## Architecture

```
Frontend:  Next.js 14 (App Router) + Tailwind CSS
Backend:   Next.js API Routes (unified deployment)
Database:  SQLite via Prisma ORM (PostgreSQL-ready)
Hosting:   Vercel (free tier)
Language:  TypeScript throughout
```

### Why this stack

- **Single deployable unit** — frontend and backend in one repo, one deploy command. Minimizes operational complexity for non-technical maintainers.
- **SQLite for development, PostgreSQL for production** — zero database setup during development. One config change for production deployment.
- **Vercel free tier** — zero ongoing hosting cost. Auto-deploys from GitHub push.
- **TypeScript** — type safety reduces bugs and improves maintainability.
- **No external API dependencies** — the system runs entirely self-contained. No third-party services to break or incur cost.

### System Design

```
┌─────────────────────────────────────────────┐
│           FRONTEND (Next.js + Tailwind)      │
│  Landing │ Staff │ Coordinator │ Donor Board  │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│           BACKEND (Next.js API Routes)       │
│  Posts API │ Match Engine │ Feed │ Stats     │
└──────────────────┬──────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────┐
│           DATABASE (SQLite / PostgreSQL)      │
│  organizations │ posts │ matches │ feed      │
└─────────────────────────────────────────────┘
```

### Match Engine Design

The match engine runs synchronously on every new post:
1. New post created (HAVE or NEED)
2. Query for opposite-type posts in the same category from different organizations
3. Prioritize by urgency (for HAVE→NEED) or expiry (for NEED→HAVE)
4. Create match records and feed events
5. Return matches to the creating user immediately

This is deterministic — same inputs always produce the same matches. No external dependencies, no latency, no failure modes beyond the database.

When a match is resolved, the engine handles quantity reconciliation:
- Transfer amount = `min(have.quantity, need.quantity)`
- Both post quantities are decremented; posts with quantity 0 auto-resolve
- Remaining pending matches for resolved posts are auto-dismissed
- Feed events include transfer details (amount moved, remaining surplus/need)

## Setup

### Prerequisites
- Node.js 18+
- npm

### Quick Start

```bash
git clone [repo-url]
cd hopelink
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run setup` | Generate Prisma client, run migrations, seed demo data |
| `npm run db:seed` | Re-seed demo data |
| `npm run db:reset` | Reset database and re-seed |

### Demo Codes

**Coordinator code:** `gmhsc-coord`

### Organization Codes

| Code | Organization | Status |
|---|---|---|
| `hou-naz` | House of Nazareth | RED — critical needs |
| `ymca-gm` | YMCA Greater Moncton | GREEN — well stocked |
| `cross-wo` | Crossroads for Women | YELLOW — expiring items |
| `harv-atl` | Harvest House Atlantic | GREEN |
| `rise-tid` | Rising Tide | RED — critical needs |
| `salvus` | Salvus | GREEN |
| `ywca-mon` | YWCA Moncton | YELLOW |
| `jhs-senb` | John Howard Society | GREEN |
| `hdc-monc` | Human Development Council | YELLOW |
| `youth-ij` | Youth Impact Jeunesse | RED |

## AI Disclosure

This project used AI tools during development:

- **Claude (Anthropic)**: Architecture planning, code generation assistance, pitch narrative development, strategic analysis of challenge brief and scoring rubric
- **GitHub Copilot**: Code completion and suggestions (if used by team members)

All AI-generated code was reviewed, tested, and modified by team members. The problem analysis, user research conversations with GMHSC liaisons, design decisions, and final pitch content reflect the team's own understanding of the challenge.

AI tools were used transparently as productivity multipliers — not as a substitute for understanding the problem or the users we're building for.

## Privacy by Design

HopeLink was designed with privacy as a core architectural principle, not an afterthought:

- **Tracks items, not people.** No personal information about individuals experiencing homelessness is collected, stored, or processed at any point.
- **Minimal personal data.** The only personal data in the system is donor contact information (name, email/phone), voluntarily provided by donors when offering help.
- **No tracking or analytics.** No cookies, no user tracking, no analytics services.
- **Organization-level access.** Staff access is via organization codes — no individual user accounts or profiles.
- **Data stays local.** For the SQLite deployment, all data stays on the hosting server. No third-party data processors.

## Deployment

HopeLink is designed for immediate deployment:

1. **Push to GitHub** → auto-deploys to Vercel
2. **Distribute org codes** to GMHSC member organizations via existing communication channels
3. **Staff access via URL** on any device — no app install required
4. **Estimated onboarding time:** <5 minutes per organization

### Production Considerations

- Migrate from SQLite to PostgreSQL (one config change in `prisma/schema.prisma`)
- Add email notifications for matches (integrate SendGrid or similar)
- Add service worker for basic offline resilience
- Add org-level visibility controls (public vs. internal posts)

### Cost

- Vercel free tier: $0/month
- No external API dependencies: $0/month
- **Total operational cost: $0**

## Team

- [Name] — [Role]
- [Name] — [Role]
- [Name] — [Role]
- [Name] — [Role]

## License

MIT
