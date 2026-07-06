import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace).
 *
 * The catalog is Google-Sheet driven, so this generates the Shopping feed live
 * from the same Sheet the site + sitemap use, CDN-cached for an hour. Submit the
 * URL https://www.utsavify.com/merchant-feed.xml in Merchant Center as a
 * scheduled fetch → the catalog stays in sync with zero manual re-uploads.
 *
 * Attribute mapping (Sheet → Merchant Center):
 *   Slug        → g:id + product link
 *   Name        → title
 *   Description → description (falls back to a generated line)
 *   Price/MRP   → g:price + g:sale_price (MRP is the list price when higher)
 *   Image1..4   → g:image_link + g:additional_image_link (relative → absolute)
 *   Category    → g:product_type (+ g:is_bundle for combos/hampers)
 * Rakhis are handmade with no GTIN/MPN, so g:identifier_exists = no.
 */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";
const SITE = "https://www.utsavify.com";
const BRAND = "Utsavify";
const TTL_MS = 60 * 60 * 1000; // 1 hour

interface Item {
  id: string;
  title: string;
  description: string;
  link: string;
  images: string[];
  price: number;
  mrp?: number;
  category: string;
  isBundle: boolean;
}

let cache: { at: number; items: Item[] } | null = null;

function s(v: unknown): string {
  return v != null ? String(v).trim() : "";
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
function xml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function cdata(v: string): string {
  // Guard the one sequence that could break a CDATA block.
  return `<![CDATA[${v.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}
/** Sheet images may be relative (/products/x.webp) or absolute (https://…). */
function absImage(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return src.startsWith("/") ? `${SITE}${src}` : `${SITE}/${src}`;
}
function isBundleCategory(cat: string): boolean {
  const c = cat.toLowerCase();
  return c.includes("combo") || c.includes("hamper") || c.includes("bundle");
}
function money(n: number): string {
  return `${n.toFixed(2)} INR`;
}

async function getItems(): Promise<Item[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;

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

  const items: Item[] = [];
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

    const images = ["Image1", "Image2", "Image3", "Image4"]
      .map((c) => s(cell(row, c)))
      .filter(Boolean)
      .map(absImage);
    if (!images.length) continue; // Merchant Center requires an image

    const category = s(cell(row, "Category")) || "Designer";
    const desc = s(cell(row, "Description")).replace(/<[^>]+>/g, "").trim();

    items.push({
      id: slug,
      title: name.slice(0, 150),
      description: (desc || `${name} — handcrafted rakhi from Utsavify. Celebrate every moment.`).slice(0, 4900),
      link: `${SITE}/product/${slug}`,
      images,
      price,
      mrp: num(cell(row, "MRP")),
      category,
      isBundle: isBundleCategory(category),
    });
  }

  cache = { at: Date.now(), items };
  return items;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  let items: Item[] = [];
  try {
    items = await getItems();
  } catch {
    items = []; // Sheet down → serve an empty-but-valid feed rather than a 500
  }

  let out = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  out += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
  out += `<channel>\n`;
  out += `  <title>Utsavify Product Feed</title>\n`;
  out += `  <link>${SITE}</link>\n`;
  out += `  <description>Handcrafted rakhis, festive combos and gifts by Utsavify.</description>\n`;

  for (const it of items) {
    // MRP is the list price when it's higher than the selling price → the
    // selling price becomes the sale_price so Google shows the discount.
    const hasSale = it.mrp != null && it.mrp > it.price;
    const listPrice = hasSale ? it.mrp! : it.price;

    out += `  <item>\n`;
    out += `    <g:id>${xml(it.id)}</g:id>\n`;
    out += `    <title>${cdata(it.title)}</title>\n`;
    out += `    <description>${cdata(it.description)}</description>\n`;
    out += `    <link>${xml(it.link)}</link>\n`;
    out += `    <g:image_link>${xml(it.images[0])}</g:image_link>\n`;
    for (const extra of it.images.slice(1, 11)) {
      out += `    <g:additional_image_link>${xml(extra)}</g:additional_image_link>\n`;
    }
    out += `    <g:availability>in_stock</g:availability>\n`;
    out += `    <g:condition>new</g:condition>\n`;
    out += `    <g:price>${money(listPrice)}</g:price>\n`;
    if (hasSale) out += `    <g:sale_price>${money(it.price)}</g:sale_price>\n`;
    out += `    <g:brand>${xml(BRAND)}</g:brand>\n`;
    out += `    <g:identifier_exists>no</g:identifier_exists>\n`;
    out += `    <g:product_type>${xml(it.category)}</g:product_type>\n`;
    if (it.isBundle) out += `    <g:is_bundle>yes</g:is_bundle>\n`;
    out += `    <g:shipping>\n      <g:country>IN</g:country>\n      <g:price>0 INR</g:price>\n    </g:shipping>\n`;
    out += `  </item>\n`;
  }

  out += `</channel>\n</rss>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(out);
}
