/**
 * Client-side report export — CSV and PDF.
 * Zero dependencies. Uses Blob + download link for CSV, print iframe for PDF.
 */

interface OrgData {
  name: string;
  type: string;
  status: string;
  activeNeeds: number;
  activeHaves: number;
  criticalNeeds: number;
  expiringItems: number;
}

interface StatsData {
  activeNeeds: number;
  activeHaves: number;
  pendingMatches: number;
  expiringItems: number;
  matchRate: number;
}

interface PostDetail {
  item: string;
  quantity: number;
  urgency: string;
  expiryDate: string | null;
  org: { name: string };
}

interface ExportData {
  stats: StatsData;
  orgs: OrgData[];
  criticalNeeds: PostDetail[];
  expiringPosts: PostDetail[];
}

function timestamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABELS: Record<string, string> = {
  red: "Red (Critical)",
  yellow: "Yellow (Needs Attention)",
  green: "Green (Healthy)",
};

function statusLabel(s: string) {
  return STATUS_LABELS[s] || s;
}

function expiryHours(date: string) {
  const h = Math.max(0, Math.round((new Date(date).getTime() - Date.now()) / 3600000));
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}

/** Fetch detail data needed for reports (called on-demand at export time) */
export async function fetchReportData(): Promise<{ criticalNeeds: PostDetail[]; expiringPosts: PostDetail[] }> {
  const [needsRes, havesRes] = await Promise.all([
    fetch("/api/posts?type=NEED&status=active"),
    fetch("/api/posts?type=HAVE&status=active"),
  ]);
  const needs: PostDetail[] = (await needsRes.json()).posts || [];
  const haves: PostDetail[] = (await havesRes.json()).posts || [];

  const criticalNeeds = needs.filter((p) => p.urgency === "critical");
  const now = Date.now();
  const seventyTwoH = 72 * 3600000;
  const expiringPosts = haves.filter(
    (p) => p.expiryDate && new Date(p.expiryDate).getTime() - now < seventyTwoH && new Date(p.expiryDate).getTime() > now
  );

  return { criticalNeeds, expiringPosts };
}



// === PDF EXPORT (via print) ===

export function exportPDF({ stats, orgs, criticalNeeds, expiringPosts }: ExportData) {
  const statusOrder = { red: 0, yellow: 1, green: 2 };
  const sorted = [...orgs].sort(
    (a, b) =>
      (statusOrder[a.status as keyof typeof statusOrder] ?? 2) -
      (statusOrder[b.status as keyof typeof statusOrder] ?? 2)
  );

  const topCriticalNeeds = criticalNeeds.slice(0, 6);
  const topExpiringPosts = expiringPosts.slice(0, 6);

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>HopeLink Network Report</title>
  <meta charset="utf-8" />
  <style>
    :root {
      --text: #0f172a;
      --muted: #475569;
      --border: #e2e8f0;
      --soft: #f8fafc;
      --blue: #2563eb;
      --red: #dc2626;
      --green: #16a34a;
      --amber: #d97706;
      --purple: #7c3aed;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: var(--text);
      background: white;
      margin: 0;
      padding: 28px;
      font-size: 13px;
      line-height: 1.45;
    }

    .page {
      max-width: 920px;
      margin: 0 auto;
    }

    .hero {
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 24px 24px 18px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      margin-bottom: 18px;
    }

    .eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue);
      margin-bottom: 8px;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 30px;
      line-height: 1.08;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .subtitle {
      margin: 0 0 10px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
    }

    .intro {
      margin: 0;
      color: #334155;
      font-size: 13px;
      max-width: 720px;
    }

    .summary-box {
      margin-top: 16px;
      background: var(--soft);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 16px;
    }

    .summary-box p {
      margin: 0 0 8px;
      font-weight: 600;
      color: #1e293b;
    }

    .summary-box ul {
      margin: 0;
      padding-left: 18px;
      color: #334155;
    }

    .summary-box li {
      margin-bottom: 4px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin: 18px 0 22px;
    }

    .metric {
      background: white;
      border: 1px solid var(--border);
      border-top: 5px solid #cbd5e1;
      border-radius: 14px;
      padding: 16px 12px 14px;
      text-align: center;
    }

    .metric.match { border-top-color: var(--blue); }
    .metric.needs { border-top-color: var(--red); }
    .metric.available { border-top-color: var(--green); }
    .metric.pending { border-top-color: var(--purple); }
    .metric.expiring { border-top-color: var(--amber); }

    .metric .value {
      font-size: 30px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 6px;
      letter-spacing: -0.03em;
    }

    .metric .label {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }

    .section-card {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      background: white;
    }

    .section-card.full {
      grid-column: 1 / -1;
    }

    h2 {
      margin: 0 0 10px;
      font-size: 16px;
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .section-note {
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th {
      text-align: left;
      background: #f8fafc;
      color: #334155;
      font-weight: 700;
      padding: 10px 10px;
      border-bottom: 1px solid #cbd5e1;
    }

    td {
      padding: 9px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #fcfcfd;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .badge-critical {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-expiry {
      background: #ffedd5;
      color: #9a3412;
    }

    .status-pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .status-red {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fecaca;
    }

    .status-yellow {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }

    .status-green {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }

    .muted {
      color: var(--muted);
    }

    .footer {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      color: #94a3b8;
      font-size: 10px;
      text-align: center;
      line-height: 1.6;
    }

    .empty {
      color: var(--muted);
      font-size: 12px;
      padding: 8px 0 2px;
    }

    @media print {
      body {
        padding: 18px;
      }

      .page {
        max-width: 100%;
      }

      .metric,
      .section-card,
      .hero,
      .summary-box {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <div class="eyebrow">HopeLink Executive Snapshot</div>
      <h1>HopeLink Network Report</h1>
      <p class="subtitle">GMHSC Coordination Snapshot — Generated ${timestamp()}</p>
      <p class="intro">
        A live summary of current needs, available resources, urgent risks, and coordination opportunities across the GMHSC network.
      </p>

      <div class="summary-box">
        <p>Executive Summary</p>
        <ul>
          <li>The network currently includes <strong>${orgs.length} organizations</strong> participating in HopeLink.</li>
          <li><strong>${stats.activeNeeds}</strong> active needs are visible across the network, with a current match rate of <strong>${stats.matchRate}%</strong>.</li>
          <li><strong>${stats.pendingMatches}</strong> coordination opportunities are currently in progress between organizations.</li>
          <li><strong>${stats.expiringItems}</strong> item${stats.expiringItems !== 1 ? "s are" : " is"} nearing expiry and may require urgent redistribution.</li>
        </ul>
      </div>
    </div>

    <div class="metrics">
      <div class="metric match">
        <div class="value">${stats.matchRate}%</div>
        <div class="label">Match Rate</div>
      </div>
      <div class="metric needs">
        <div class="value">${stats.activeNeeds}</div>
        <div class="label">Active Needs</div>
      </div>
      <div class="metric available">
        <div class="value">${stats.activeHaves}</div>
        <div class="label">Available Items</div>
      </div>
      <div class="metric pending">
        <div class="value">${stats.pendingMatches}</div>
        <div class="label">Pending Matches</div>
      </div>
      <div class="metric expiring">
        <div class="value">${stats.expiringItems}</div>
        <div class="label">Expiring Soon</div>
      </div>
    </div>

    <div class="sections">
      <div class="section-card">
        <h2>Critical Needs</h2>
        <p class="section-note">Highest-priority needs currently visible across the network.</p>
        ${
          topCriticalNeeds.length > 0
            ? `<table>
                <tr>
                  <th>Organization</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Urgency</th>
                </tr>
                ${topCriticalNeeds
                  .map(
                    (p) => `<tr>
                      <td>${p.org.name}</td>
                      <td>${p.item}</td>
                      <td>${p.quantity}</td>
                      <td><span class="badge badge-critical">Critical</span></td>
                    </tr>`
                  )
                  .join("")}
              </table>`
            : `<div class="empty">No critical needs at this time.</div>`
        }
      </div>

      <div class="section-card">
        <h2>Items Nearing Expiry</h2>
        <p class="section-note">Items requiring timely redistribution to reduce waste.</p>
        ${
          topExpiringPosts.length > 0
            ? `<table>
                <tr>
                  <th>Organization</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Expires In</th>
                </tr>
                ${topExpiringPosts
                  .map(
                    (p) => `<tr>
                      <td>${p.org.name}</td>
                      <td>${p.item}</td>
                      <td>${p.quantity}</td>
                      <td><span class="badge badge-expiry">${expiryHours(p.expiryDate!)}</span></td>
                    </tr>`
                  )
                  .join("")}
              </table>`
            : `<div class="empty">No expiring items currently flagged.</div>`
        }
      </div>

      <div class="section-card full">
        <h2>Organization Summary</h2>
        <p class="section-note">Network-wide snapshot of organizational status, needs, and available resources.</p>
        <table>
          <tr>
            <th>Organization</th>
            <th>Type</th>
            <th>Status</th>
            <th>Needs</th>
            <th>Available</th>
            <th>Critical</th>
            <th>Expiring</th>
          </tr>
          ${sorted
            .map((o) => {
              const statusClass =
                o.status === "red"
                  ? "status-red"
                  : o.status === "yellow"
                  ? "status-yellow"
                  : "status-green";

              return `<tr>
                <td><strong>${o.name}</strong></td>
                <td class="muted">${o.type}</td>
                <td><span class="status-pill ${statusClass}">${statusLabel(o.status)}</span></td>
                <td>${o.activeNeeds}</td>
                <td>${o.activeHaves}</td>
                <td>${o.criticalNeeds || "&mdash;"}</td>
                <td>${o.expiringItems || "&mdash;"}</td>
              </tr>`;
            })
            .join("")}
        </table>
      </div>
    </div>

    <div class="footer">
      Report generated by HopeLink<br>
      GMHSC Network Coordination Platform<br>
      Hack4Change 2026 Prototype
    </div>
  </div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1000);
    }, 250);
  };

  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch {}
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 1000);
  }, 1200);
}

