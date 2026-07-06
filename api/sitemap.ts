import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Dynamic sitemap. The catalog is Google-Sheet driven and changes without a
 * redeploy, so a static public/sitemap.xml goes stale. This generates the
 * sitemap live from the Sheet (every Active + InStock product) and is
 * CDN-cached for an hour, so it always reflects the current catalog.
 */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";
const SITE = "https://www.utsavify.com";
const TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { at: number; slugs: string[] } | null = null;

function s(v: unknown): string {
  return v != null ? String(v).trim() : "";
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function getSlugs(): Promise<string[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.slugs;

  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const raw = await res.text();
  const json = raw.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(json);

  const cols: string[] = data.table.cols.map((c: { label: string }) => c.label);
  const cellOf = (row: { c: ({ v: unknown } | null)[] }, label: string): unknown => {
    const i = cols.indexOf(label);
    return i >= 0 ? row.c[i]?.v ?? null : null;
  };

  const slugs: string[] = [];
  for (const row of data.table.rows as { c: ({ v: unknown } | null)[] }[]) {
    if (!row?.c) continue;
    const slug = s(cellOf(row, "Slug"));
    const name = s(cellOf(row, "Name"));
    const price = num(cellOf(row, "Price"));
    if (!slug || !name || !price) continue;
    if (s(cellOf(row, "Status")) !== "Active" || s(cellOf(row, "InStock")) !== "Yes") continue;
    if (!slugs.includes(slug)) slugs.push(slug);
  }

  cache = { at: Date.now(), slugs };
  return slugs;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().slice(0, 10);

  // If the Sheet is unreachable, still return a valid sitemap (homepage only)
  // rather than a 500 — a partial sitemap beats a broken one.
  let slugs: string[] = [];
  try {
    slugs = await getSlugs();
  } catch {
    slugs = [];
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url><loc>${SITE}/return-policy</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
  for (const slug of slugs) {
    xml += `  <url><loc>${SITE}/product/${slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  }
  xml += `</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
