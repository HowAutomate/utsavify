import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * /raksha-bandhan-2026-gift-guide — server-rendered seasonal landing page.
 * Targets long-tail queries ("raksha bandhan 2026 date", "last date to order
 * rakhi") and acts as a crawlable internal-link hub to every product. Product
 * cards render live from the catalog Sheet (same source as the sitemap), so
 * the page never goes stale. CDN-cached 1h.
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

type Theme = { id: string; title: string; blurb: string; match: (p: P) => boolean };

const themes: Theme[] = [
  {
    id: "rudraksh",
    title: "Rudraksh Rakhis — for the spiritual brother",
    blurb:
      "Rudraksh beads carry deep spiritual significance — a blessing he can wear. The most-gifted choice for brothers who value tradition.",
    match: (p) => /rudraksh/i.test(p.name) && !/combo|set/i.test(p.name) && !/bracelet/i.test(p.name),
  },
  {
    id: "designer",
    title: "Peacock & Designer Rakhis — for the style-conscious",
    blurb:
      "Peacock motifs, morpankh feathers and kundan work — statement rakhis that photograph beautifully on the thali.",
    match: (p) => /peacock|morpankh|kundan|designer|silver|evil eye/i.test(p.name) && !/combo|set/i.test(p.name),
  },
  {
    id: "bracelet",
    title: "Bracelet Rakhis — a rakhi he can wear all year",
    blurb:
      "Bracelet-style rakhis that don't come off after the festival — the practical pick for brothers who lose thread rakhis in a week.",
    match: (p) => /bracelet|braslate/i.test(p.name) && !/combo|set of/i.test(p.name),
  },
  {
    id: "bhaiya-bhabhi",
    title: "Bhaiya-Bhabhi Sets — one for him, one for her",
    blurb: "Matching rakhi and lumba sets so bhabhi is never an afterthought.",
    match: (p) => /bhabhi/i.test(p.name) || /bhabhi/i.test(p.category),
  },
  {
    id: "combos",
    title: "Family Combo Packs — one order, every sibling",
    blurb:
      "Combo sets of 3-4 rakhis in one box — shipping paid once, every brother and cousin covered.",
    match: (p) => /combo|hamper|set of/i.test(p.name) || /combo|hamper/i.test(p.category),
  },
];

function card(p: P): string {
  const strike = p.mrp && p.mrp > p.price ? `<s>₹${p.mrp}</s> ` : "";
  const off = p.mrp && p.mrp > p.price ? ` <span class="off">${Math.round((1 - p.price / p.mrp) * 100)}% off</span>` : "";
  return (
    `<a class="card" href="/product/${esc(p.slug)}">` +
    `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />` +
    `<span class="cname">${esc(p.name)}</span>` +
    `<span class="cprice">${strike}<b>₹${p.price}</b>${off}</span>` +
    `</a>`
  );
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  let products: P[] = [];
  try {
    products = await getProducts();
  } catch {
    products = []; // page still renders — content is useful without the grids
  }

  const used = new Set<string>();
  const sections = themes
    .map((t) => {
      const items = products.filter((p) => !used.has(p.slug) && t.match(p)).slice(0, 6);
      items.forEach((p) => used.add(p.slug));
      if (!items.length) return "";
      return (
        `<section id="${t.id}"><h2>${t.title}</h2><p>${t.blurb}</p>` +
        `<div class="grid">${items.map(card).join("")}</div></section>`
      );
    })
    .join("");

  const title = "Raksha Bandhan 2026: Date, Order Deadline & Rakhi Gift Ideas";
  const desc =
    "Raksha Bandhan 2026 is on Friday, August 28. Order your rakhi by August 20 for on-time delivery across India. Handpicked gift ideas from ₹149.";
  const canonical = `${SITE}/raksha-bandhan-2026-gift-guide`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        url: canonical,
        description: desc,
        isPartOf: { "@type": "WebSite", name: "Utsavify", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Raksha Bandhan 2026 Gift Guide" },
        ],
      },
    ],
  };

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} | Utsavify</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="article" />
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
h1{color:var(--maroon);font-size:30px;line-height:1.25;margin:28px 0 10px}
h2{color:var(--saffron);font-size:21px;margin:40px 0 6px}
p{font-size:16px}
.key{background:#fff;border:1px solid rgba(122,31,43,.18);border-radius:14px;padding:18px 22px;margin:22px 0;font-size:17px}
.key b{color:var(--maroon)}
.deadline{display:inline-block;background:var(--maroon);color:var(--ivory);border-radius:999px;padding:10px 22px;font-size:14px;font-weight:700;letter-spacing:.4px;margin:6px 0 2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin:16px 0 4px}
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

<h1>Raksha Bandhan 2026: Date, Order Deadline &amp; Rakhi Gift Ideas</h1>

<div class="key">
<b>When is Raksha Bandhan 2026?</b> Raksha Bandhan falls on <b>Friday, 28 August 2026</b>.<br />
<b>Last date to order rakhi online:</b> place your order by <b>20 August 2026</b> for guaranteed delivery anywhere in India before the festival.<br />
<span class="deadline">Order by Aug 20 · Free Delivery Across India</span>
</div>

<p>Every rakhi at Utsavify is handcrafted, ships free anywhere in India, and arrives with roli chawal so the thali is ready the moment the box opens. Prices start at ₹149, Cash on Delivery is available on orders under ₹500, and prepaid orders get an extra 5% off. Below is our guide to picking the right rakhi for every brother — by personality, not just by design.</p>

${sections}

<h2>Not sure which one? Start here</h2>
<p>If your brother is traditional, a <a href="#rudraksh">Rudraksh rakhi</a> never misses. If he cares about style, go <a href="#designer">peacock or kundan</a>. If he loses his rakhi within a week every year, a <a href="#bracelet">bracelet rakhi</a> stays on. Married brother? A <a href="#bhaiya-bhabhi">bhaiya-bhabhi set</a> covers both. And if you're shopping for the whole family, a <a href="#combos">combo pack</a> pays shipping once for everyone.</p>
<p style="text-align:center"><a class="cta" href="/">Shop All Rakhis →</a></p>

<h2>Raksha Bandhan 2026 — Frequently Asked Questions</h2>
<div class="faq">
<h3>What date is Raksha Bandhan in 2026?</h3>
<p>Raksha Bandhan 2026 is on Friday, 28 August 2026, on Shravan Purnima. Check your local panchang for the exact muhurat timing in your city.</p>
<h3>What is the last date to order a rakhi online for Raksha Bandhan 2026?</h3>
<p>Order by 20 August 2026 to be safe. Utsavify dispatches within 1–2 business days and delivery takes 3–7 business days depending on your pincode.</p>
<h3>Is delivery really free?</h3>
<p>Yes — free delivery on every order, anywhere in India, with no minimum order value.</p>
<h3>Is Cash on Delivery available?</h3>
<p>Yes, COD is available on orders under ₹500. Prepaid orders (UPI, cards, wallets) get an extra 5% discount.</p>
<h3>What comes with each rakhi?</h3>
<p>Every rakhi ships with roli chawal so it's ready for the ceremony. Product pages list the exact contents of each set.</p>
<h3>What if my rakhi arrives damaged?</h3>
<p>We accept returns within 3 days of delivery for damaged or defective items — see our <a href="/return-policy">return policy</a>.</p>
</div>

<footer>
<a href="/">Home</a> · <a href="/return-policy">Return &amp; Shipping Policy</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-conditions">Terms &amp; Conditions</a><br />
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
