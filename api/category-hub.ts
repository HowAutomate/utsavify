import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Category hub pages, server-rendered live from the catalog Sheet:
 *   /rakhi-for-brother        (?hub=brother)  — all individual rakhis
 *   /rakhi-combo-family-pack  (?hub=combo)    — combo sets + box-bundle pitch
 * Same pattern as api/rakhi-guide.ts: crawlable HTML, product cards with live
 * prices, 1h CDN cache, graceful fallback if the Sheet is unreachable.
 */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";
const SITE = "https://www.utsavify.com";
const TTL_MS = 60 * 60 * 1000;

type P = { slug: string; name: string; price: number; mrp?: number; image: string; category: string };

let cache: { at: number; products: P[] } | null = null;

const s = (v: unknown) => (v != null ? String(v).trim() : "");
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const esc = (x: string) =>
  x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const absImg = (img: string) => (img.startsWith("http") ? img : `${SITE}${img}`);

async function getProducts(): Promise<P[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.products;
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const raw = await res.text();
  const json = raw.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(json);
  const cols: string[] = data.table.cols.map((c: { label: string }) => c.label);
  const cell = (row: { c: ({ v: unknown } | null)[] }, label: string) => {
    const i = cols.indexOf(label);
    return i >= 0 ? row.c[i]?.v ?? null : null;
  };
  const out: P[] = [];
  for (const row of data.table.rows as { c: ({ v: unknown } | null)[] }[]) {
    if (!row?.c) continue;
    const slug = s(cell(row, "Slug"));
    const name = s(cell(row, "Name"));
    const price = num(cell(row, "Price"));
    const image = s(cell(row, "Image1"));
    if (!slug || !name || !price || !image) continue;
    if (s(cell(row, "Status")) !== "Active" || s(cell(row, "InStock")) !== "Yes") continue;
    out.push({
      slug,
      name,
      price,
      mrp: num(cell(row, "MRP")),
      image: absImg(image),
      category: s(cell(row, "Category")),
    });
  }
  cache = { at: Date.now(), products: out };
  return out;
}

const isCombo = (p: P) =>
  /combo|hamper|set of/i.test(p.name) || /combo|hamper|bundle/i.test(p.category);

function card(p: P): string {
  const strike = p.mrp && p.mrp > p.price ? `<s>₹${p.mrp}</s> ` : "";
  const off =
    p.mrp && p.mrp > p.price
      ? ` <span class="off">${Math.round((1 - p.price / p.mrp) * 100)}% off</span>`
      : "";
  return (
    `<a class="card" href="/product/${esc(p.slug)}">` +
    `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />` +
    `<span class="cname">${esc(p.name)}</span>` +
    `<span class="cprice">${strike}<b>₹${p.price}</b>${off}</span>` +
    `</a>`
  );
}

type HubConfig = {
  path: string;
  title: string;
  metaDesc: string;
  h1: string;
  intro: string[];
  filter: (p: P) => boolean;
  afterGrid: string;
  faq: [string, string][];
};

const HUBS: Record<string, HubConfig> = {
  brother: {
    path: "/rakhi-for-brother",
    title: "Buy Rakhi for Brother Online from ₹149 | Free Delivery India",
    metaDesc:
      "Handcrafted rakhis for your brother from ₹149 — Rudraksh, peacock, kundan & bracelet designs. Free delivery across India, COD available. Order by Aug 20.",
    h1: "Buy Rakhi Online for Your Brother — Free Delivery Across India",
    intro: [
      "The rakhi you tie says something about the bond it stands for. Every rakhi below is handcrafted, ships free anywhere in India with roli chawal included, and starts at just ₹149 — so the hard part isn't the price, it's choosing which one suits <em>your</em> brother.",
      "Traditional brothers love <strong>Rudraksh designs</strong>; style-conscious ones go for <strong>peacock and kundan work</strong>; and for the brother who loses his rakhi within a week, a <strong>bracelet rakhi</strong> stays on long after the festival. Cash on Delivery is available on orders under ₹500, and paying online gets you an extra 5% off.",
    ],
    filter: (p) => !isCombo(p),
    afterGrid:
      `<p>Shopping for more than one brother — or for bhabhi too? See our <a href="/rakhi-combo-family-pack">family combo packs</a> (one box, bigger savings) or browse the full <a href="/raksha-bandhan-2026-gift-guide">Raksha Bandhan 2026 gift guide</a> for ideas by personality.</p>`,
    faq: [
      [
        "How quickly will my brother's rakhi arrive?",
        "We dispatch within 1–2 business days and delivery takes 3–7 business days anywhere in India. For Raksha Bandhan 2026 (Friday, 28 August), order by 20 August to be safe.",
      ],
      [
        "Is delivery free?",
        "Yes — free delivery on every order across India, no minimum order value.",
      ],
      [
        "Can I pay Cash on Delivery?",
        "COD is available on orders under ₹500. Prepaid orders (UPI, cards, wallets) get an extra 5% discount.",
      ],
      [
        "What comes with the rakhi?",
        "Every rakhi ships with roli chawal so the thali is ready the moment the box opens.",
      ],
    ],
  },
  combo: {
    path: "/rakhi-combo-family-pack",
    title: "Rakhi Combo Packs & Family Sets from ₹249 | Free Delivery",
    metaDesc:
      "Rakhi combo packs for the whole family — handcrafted rakhi sets in one box with bundle savings on every extra. Free delivery across India. Order by Aug 20.",
    h1: "Rakhi Combo Packs for the Whole Family — One Box, Every Sibling",
    intro: [
      "Two brothers, a cousin you can't skip, and bhabhi too — buying rakhis one at a time means placing four separate orders. Our combo packs put <strong>several handcrafted rakhis in a single box</strong>, delivered free anywhere in India, so one order covers the whole family.",
      "Prefer to pick your own mix? Add individual rakhis to your cart and our <strong>bundle box</strong> automatically groups up to 5 rakhis into one box — every extra rakhi is charged at a reduced add-on price. The savings show up right in your cart before you pay.",
    ],
    filter: isCombo,
    afterGrid:
      `<p>Want to build your own combination instead? Start from the <a href="/rakhi-for-brother">individual rakhi collection</a> and add up to 5 to one box — or browse the <a href="/raksha-bandhan-2026-gift-guide">Raksha Bandhan 2026 gift guide</a> for ideas by personality.</p>`,
    faq: [
      [
        "Can I mix different rakhi designs in one order?",
        "Yes. Ready-made combo sets have fixed contents, but you can also add any individual rakhis to your cart and the bundle box automatically groups up to 5 into one box with add-on pricing.",
      ],
      [
        "Do I pay delivery for each rakhi?",
        "No — delivery is free on every order across India, and the bundle box means multiple rakhis travel together in one package.",
      ],
      [
        "How many rakhis fit in one bundle box?",
        "Up to 5 rakhis share one box. A sixth rakhi starts a new box automatically in the cart.",
      ],
      [
        "When should I order for Raksha Bandhan 2026?",
        "Raksha Bandhan is on Friday, 28 August 2026. Order by 20 August for guaranteed on-time delivery anywhere in India.",
      ],
    ],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hub = HUBS[String(req.query.hub || "")];
  if (!hub) return res.status(404).send("Not found");

  let products: P[] = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }
  const items = products.filter(hub.filter);
  const canonical = `${SITE}${hub.path}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: hub.h1,
        url: canonical,
        description: hub.metaDesc,
        isPartOf: { "@type": "WebSite", name: "Utsavify", url: `${SITE}/` },
      },
      {
        "@type": "ItemList",
        itemListElement: items.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: `${SITE}/product/${p.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: hub.h1 },
        ],
      },
    ],
  };

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(hub.title)} | Utsavify</title>
<meta name="description" content="${esc(hub.metaDesc)}" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<meta property="og:title" content="${esc(hub.title)}" />
<meta property="og:description" content="${esc(hub.metaDesc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE}/og-image.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{--ivory:rgb(246,242,231);--maroon:#7a1f2b;--ink:#241c1a;--gold:#b58a3c;--saffron:#e07a1f}
*{box-sizing:border-box}
body{margin:0;background:var(--ivory);color:var(--ink);font-family:Georgia,"Times New Roman",serif;line-height:1.7}
.wrap{max-width:880px;margin:0 auto;padding:40px 20px 80px}
header{text-align:center;margin-bottom:8px}
.brand{font-size:28px;color:var(--maroon);font-weight:700}
.brand a{color:inherit;text-decoration:none}
.tagline{color:var(--gold);font-style:italic;font-size:14px}
h1{color:var(--maroon);font-size:29px;line-height:1.25;margin:26px 0 12px}
h2{color:var(--saffron);font-size:21px;margin:38px 0 6px}
p{font-size:16px}
.deadline{display:inline-block;background:var(--maroon);color:var(--ivory);border-radius:999px;padding:9px 20px;font-size:13.5px;font-weight:700;letter-spacing:.4px;margin:4px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin:20px 0 8px}
.card{background:#fff;border:1px solid rgba(122,31,43,.14);border-radius:12px;overflow:hidden;text-decoration:none;color:var(--ink);display:flex;flex-direction:column}
.card img{width:100%;aspect-ratio:1;object-fit:cover;background:var(--ivory)}
.cname{font-size:13.5px;padding:8px 10px 0;line-height:1.35}
.cprice{font-size:14px;padding:4px 10px 12px;color:var(--maroon)}
.cprice s{color:#9b8d84;font-weight:400}
.off{color:var(--saffron);font-size:12px;font-weight:700}
.cta{display:inline-block;background:var(--saffron);color:#fff;text-decoration:none;padding:13px 30px;border-radius:999px;font-weight:700;font-size:15px;margin:10px 0}
.faq{background:#fff;border:1px solid rgba(122,31,43,.14);border-radius:12px;padding:6px 22px;margin:14px 0}
.faq h3{color:var(--maroon);font-size:16.5px;margin:16px 0 4px}
.faq p{margin:0 0 16px;font-size:15px}
footer{margin-top:56px;padding-top:22px;border-top:1px solid rgba(36,28,26,.12);text-align:center;font-size:13.5px;color:#6b615c}
footer a{color:var(--maroon)}
</style>
</head>
<body>
<div class="wrap">
<header><div class="brand"><a href="/">Utsavify</a></div><div class="tagline">Celebrate Every Moment</div></header>

<h1>${hub.h1}</h1>
<span class="deadline">Raksha Bandhan: Fri, Aug 28 · Order by Aug 20 · Free Delivery</span>
${hub.intro.map((p) => `<p>${p}</p>`).join("\n")}

<div class="grid">${items.map(card).join("")}</div>

${hub.afterGrid}
<p style="text-align:center"><a class="cta" href="/">Shop the Full Collection →</a></p>

<h2>Frequently Asked Questions</h2>
<div class="faq">
${hub.faq.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join("\n")}
</div>

<footer>
<a href="/">Home</a> · <a href="/raksha-bandhan-2026-gift-guide">Gift Guide 2026</a> · <a href="/return-policy">Return &amp; Shipping Policy</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-conditions">Terms &amp; Conditions</a><br />
Utsavify is operated by JHL Enterprises · GSTIN 08DIIPG6918L1ZR · Alwar, Rajasthan<br />
<a href="mailto:hello@utsavify.com">hello@utsavify.com</a> · <a href="tel:+919024267783">+91 90242 67783</a>
</footer>
</div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
