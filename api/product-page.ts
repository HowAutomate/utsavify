import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side meta injection for /product/:slug.
 *
 * The site is a client-rendered SPA, so every product URL used to serve the
 * same generic index.html (same <title> as the homepage, no canonical, no
 * product content). To Googlebot's first pass all product URLs looked like
 * duplicates of the homepage — hence "Discovered – currently not indexed".
 *
 * This function fetches the app shell (built index.html) and the catalog
 * Sheet, then injects a unique <title>, meta description, canonical, Open
 * Graph tags and Product JSON-LD for the requested slug — so crawlers get a
 * real, unique page without executing JavaScript. The React app still hydrates
 * normally for human visitors.
 */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";
const SITE = "https://www.utsavify.com";
const TTL_MS = 5 * 60 * 1000;

type SheetProduct = {
  slug: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  category: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
};

let cache: { at: number; products: SheetProduct[] } | null = null;

function s(v: unknown): string {
  return v != null ? String(v).trim() : "";
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function absImg(img: string): string {
  if (!img) return `${SITE}/icon-512x512.png`;
  if (/^https?:\/\//i.test(img)) return img;
  return `${SITE}${img.startsWith("/") ? "" : "/"}${img}`;
}

async function getProducts(): Promise<SheetProduct[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.products;

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

  const out: SheetProduct[] = [];
  for (const row of data.table.rows as { c: ({ v: unknown } | null)[] }[]) {
    if (!row?.c) continue;
    const slug = s(cellOf(row, "Slug"));
    const name = s(cellOf(row, "Name"));
    const price = num(cellOf(row, "Price"));
    if (!slug || !name || !price) continue;
    if (s(cellOf(row, "Status")) !== "Active" || s(cellOf(row, "InStock")) !== "Yes") continue;

    const images = ["Image1", "Image2", "Image3", "Image4"]
      .map((c) => s(cellOf(row, c)))
      .filter(Boolean);

    out.push({
      slug,
      name,
      price,
      mrp: num(cellOf(row, "MRP")),
      image: images[0] ?? "",
      category: s(cellOf(row, "Category")) || "Designer",
      description: s(cellOf(row, "Description")) || undefined,
      metaTitle: s(cellOf(row, "MetaTitle")) || undefined,
      metaDescription: s(cellOf(row, "MetaDescription")) || undefined,
    });
  }

  cache = { at: Date.now(), products: out };
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = s(Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug);
  const host = req.headers.host || "www.utsavify.com";

  // 1. Fetch the built app shell. /index.html is a static file (not this
  //    function), so there's no request loop.
  let shell: string;
  try {
    shell = await fetch(`https://${host}/index.html`).then((r) => r.text());
  } catch {
    res.setHeader("Location", "/index.html");
    return res.status(302).end();
  }

  // 2. Fetch catalog. If the Sheet is unreachable, serve the shell unchanged
  //    so product pages never break for visitors.
  let products: SheetProduct[];
  try {
    products = await getProducts();
  } catch {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(shell);
  }

  const canonical = `${SITE}/product/${slug}`;
  const product = products.find((p) => p.slug === slug);

  // 3. Unknown slug → keep it out of the index (avoid a soft 404).
  if (!product) {
    const html = shell.replace(/<\/head>/i, `<meta name="robots" content="noindex">\n</head>`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(404).send(html);
  }

  const title = product.metaTitle || `${product.name} — Utsavify`;
  const descFull =
    product.metaDescription ||
    product.description ||
    `Buy ${product.name} — a handcrafted Rakhi from Utsavify. Premium quality, soulful designs, delivered with love across India.`;
  // Truncate at a word boundary so SERP snippets never end mid-word.
  const desc =
    descFull.length > 160
      ? `${descFull.slice(0, 157).replace(/\s+\S*$/, "").trimEnd()}…`
      : descFull;
  const img = absImg(product.image);

  // Offers valid ~30 days out; regenerated on every request so it never lapses.
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: canonical,
    image: [img],
    description: descFull,
    sku: product.slug,
    category: product.category,
    brand: { "@type": "Brand", name: "Utsavify" },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil,
      availability: "https://schema.org/InStock",
      // Site-wide policy: free India-wide delivery, 1-2d handling, 3-7d transit
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      // No crawlable category URLs exist, so position 2 is name-only per Google guidance.
      { "@type": "ListItem", position: 2, name: product.category || "Rakhis" },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  const injected =
    `<link rel="canonical" href="${canonical}">\n` +
    `<meta property="og:type" content="product">\n` +
    `<meta property="og:title" content="${esc(title)}">\n` +
    `<meta property="og:description" content="${esc(desc)}">\n` +
    `<meta property="og:url" content="${canonical}">\n` +
    `<meta property="og:image" content="${esc(img)}">\n` +
    `<meta name="twitter:card" content="summary_large_image">\n` +
    `<meta name="twitter:title" content="${esc(title)}">\n` +
    `<meta name="twitter:description" content="${esc(desc)}">\n` +
    `<meta name="twitter:image" content="${esc(img)}">\n` +
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` +
    `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>\n`;

  // 4. Replace the generic tags, strip the shell's generic OG/Twitter tags,
  //    homepage canonical and homepage JSON-LD (Organization/WebSite) to
  //    avoid duplicates, then inject the product-specific set.
  const html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "")
    .replace(/<meta\s+property="og:(?:title|description|type|image|url|image:width|image:height)"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:(?:title|description|image|card)"[^>]*>\s*/gi, "")
    .replace(/<\/head>/i, `${injected}</head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
