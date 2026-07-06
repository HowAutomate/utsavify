import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * llms.txt — a concise, AI-crawler-friendly overview of the store.
 *
 * Served at /llms.txt (see llmstxt.org). This is a GEO (Generative Engine
 * Optimization) asset: it gives ChatGPT, Perplexity, Google AI Overviews and
 * other LLM-based search a clean, structured summary of what Utsavify sells and
 * where to find it, improving the odds of being cited for gifting / rakhi
 * queries. Product list is generated live from the same catalog Sheet as the
 * sitemap + Merchant feed, so it never goes stale. CDN-cached 1 hour.
 */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";
const SITE = "https://www.utsavify.com";
const TTL_MS = 60 * 60 * 1000;

interface P { slug: string; name: string; price: number; category: string; }
let cache: { at: number; products: P[] } | null = null;

function s(v: unknown): string { return v != null ? String(v).trim() : ""; }
function num(v: unknown): number | undefined { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : undefined; }

async function getProducts(): Promise<P[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.products;
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const raw = await res.text();
  const json = raw.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(json);
  const cols: string[] = data.table.cols.map((c: { label: string }) => c.label);
  const cell = (row: { c: ({ v: unknown } | null)[] }, label: string): unknown => {
    const i = cols.indexOf(label);
    return i >= 0 ? row.c[i]?.v ?? null : null;
  };
  const products: P[] = [];
  const seen = new Set<string>();
  for (const row of data.table.rows as { c: ({ v: unknown } | null)[] }[]) {
    if (!row?.c) continue;
    const slug = s(cell(row, "Slug"));
    const name = s(cell(row, "Name"));
    const price = num(cell(row, "Price"));
    if (!slug || !name || !price) continue;
    if (s(cell(row, "Status")) !== "Active" || s(cell(row, "InStock")) !== "Yes") continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    products.push({ slug, name, price, category: s(cell(row, "Category")) || "Rakhi" });
  }
  cache = { at: Date.now(), products };
  return products;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  let products: P[] = [];
  try { products = await getProducts(); } catch { products = []; }

  const lines: string[] = [];
  lines.push("# Utsavify");
  lines.push("");
  lines.push("> Handcrafted Raksha Bandhan rakhis, family combo sets and festive gifts, delivered across India. Free delivery, Cash on Delivery available, prices from ₹145.");
  lines.push("");
  lines.push(
    "Utsavify is an Indian e-commerce brand specialising in handcrafted rakhis for Raksha Bandhan — including Rudraksh, Kundan, Peacock, Evil Eye, Ganesh Ji, Om and Bhaiya-Bhabhi designs — plus family combo sets and gift hampers. Every rakhi is handpicked and ships pan-India. Operated by JHL Enterprises."
  );
  lines.push("");

  lines.push("## Key pages");
  lines.push(`- [Shop Rakhis & Combos](${SITE}/): The full 2026 rakhi collection and family combo sets`);
  lines.push(`- [Return, Refund & Shipping Policy](${SITE}/return-policy): 3-day returns on damaged items, free delivery across India`);
  lines.push(`- [Sitemap](${SITE}/sitemap.xml): All product URLs, updated in real time`);
  lines.push("");

  if (products.length) {
    lines.push("## Products");
    for (const p of products) {
      lines.push(`- [${p.name}](${SITE}/product/${p.slug}): ₹${p.price} — ${p.category}`);
    }
    lines.push("");
  }

  lines.push("## Contact");
  lines.push("- Email: hello@utsavify.com");
  lines.push("- WhatsApp / Phone: +91 90242 67783");
  lines.push("- Instagram: @utsavify2026");
  lines.push("");

  lines.push("## About");
  lines.push("Utsavify is operated by JHL Enterprises (GSTIN 08DIIPG6918L1ZR), based in Alwar, Rajasthan, India. Order by August 20, 2026 for guaranteed Raksha Bandhan delivery.");
  lines.push("");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(lines.join("\n"));
}
