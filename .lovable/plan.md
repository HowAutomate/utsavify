## Goal

Transform the existing single-page store from "KaijuCore" anime collectibles into **Utsavify** — a festive Indian e-commerce site with two equal hero categories: **Rakhi** (Raksha Bandhan collection) and **Toys** (remote-control helicopter, truck, car, etc.).

## Brand & design system

- **Name**: `UTSAVIFY` (logo with accent on "ify" in marigold/gold)
- **Palette** (rewritten in `src/styles.css`, oklch tokens):
  - Saffron primary `oklch(0.72 0.18 55)`
  - Maroon deep `oklch(0.38 0.14 25)`
  - Gold accent `oklch(0.82 0.13 85)`
  - Ivory background `oklch(0.97 0.012 80)`
  - Ink `oklch(0.20 0.02 30)`
- **Typography**: swap Anton for **Fraunces** (display, ornamental serif) + keep **Inter** for body. Add a Devanagari-friendly accent line via **Tiro Devanagari Hindi**.
- Decorative motifs: thin gold rule lines, paisley/diya inspired badges. Drop hyper-pop italic uppercase; keep bold but warmer.

## Image pipeline

### Rakhi photos (use uploads, no AI)
- Copy `new_rakhi_shoot.zip` singles (`IMG_*.jpg`) → `src/assets/rakhi/single/` as primary product hero shots.
- Copy matching multi-angle gallery shots (`*_image_url_1/2/3.jpg`) from `new_downloaded_images.zip` → `src/assets/rakhi/gallery/` for product galleries (3-up).
- Copy `Combo_*.jpg` flat-lays → `src/assets/rakhi/combos/` for the "Family Sets" strip and category tiles.
- Catalog of ~10 rakhi SKUs: peacock-blue, rudraksh, evil-eye, elephant, ganesh-ji, pearl, kids-cartoon, lumba (bhabhi), bracelet-style, premium-stone — names inferred from the SKU codes (`PEKBS`, `RUDWB`, `EVLEY`, `GANSHJI`, `RUGAEV`, `RUDWC`, `SLRPERUEV`).

### Toy photos (AI-generated, premium quality)
Generate 6 clean product shots on soft ivory backgrounds, top-down/3-quarter angle:
1. RC helicopter (red/silver, 3.5-channel)
2. RC monster truck (orange, oversized wheels)
3. RC sports car (yellow Lamborghini-style)
4. RC excavator/JCB (yellow construction)
5. Plush teddy bear set
6. Wooden educational blocks (kids classic)

Save to `src/assets/toys/`. Use premium tier for clean text-free product photography.

### Hero imagery
- New hero collage: rakhi thali + RC helicopter + gift box, festive saffron/maroon backdrop. AI-generated `src/assets/hero-utsavify.jpg`.

## Page structure (`src/routes/index.tsx`)

```text
[Promo bar]    Free shipping on Rakhi orders ₹499+ | Raksha Bandhan: Aug 09
[Nav]          UTSAVIFY  •  Rakhi  •  Toys  •  Gift Sets  •  Track Order  •  Cart
[Hero]         Split: "Tie the bond. Spark the joy." headline + dual CTAs
                 → "Shop Rakhi" (saffron)  → "Shop Toys" (maroon)
[Dual category panels — EQUAL SPLIT]
   ┌──────────────────────┬──────────────────────┐
   │  RAKHI COLLECTION    │  TOYS & RC           │
   │  (combo flat-lay)    │  (helicopter render) │
   │  "Bandhan 2026"      │  "Power Up Playtime" │
   └──────────────────────┴──────────────────────┘
[Featured Rakhis]    4-tile grid: Peacock, Rudraksh, Evil-Eye, Elephant (real photos)
[Featured Toys]      4-tile grid: Helicopter, Truck, Car, Excavator (AI shots)
[Combo / Family Sets]  Horizontal strip of Combo_1..Combo_6
[Festive promo]      Maroon band: "Order by Aug 5 for Raksha Bandhan delivery"
[Trust strip]        COD • Pan-India shipping • Easy returns • Secure pay (UPI/cards)
[Footer]             Brand • Shop • Help • Contact, ©2026 Utsavify
```

Each product card uses ₹ pricing, "Add to Cart" CTA, badge ("Bestseller", "New", "Combo Pack").

## Files to change

- `src/styles.css` — replace brand tokens, swap font imports (Fraunces, Tiro Devanagari Hindi).
- `src/routes/index.tsx` — full rewrite for Utsavify (keep the file structure and head() pattern).
- `src/assets/` — add `rakhi/single/`, `rakhi/gallery/`, `rakhi/combos/`, `toys/` directories with copied + AI-generated images. Old anime assets stay (unused) or can be deleted.
- `src/routes/__root.tsx` — only if global title/favicon needs updating.

## Out of scope (for this turn)
- No cart logic, no checkout, no Lovable Cloud yet — visuals only.
- No separate `/products/[slug]` routes; we stay single-page.
- Toy gallery uses 1 AI shot per product (no 3-up gallery for toys yet).

## Open question for you
Pricing — should I use realistic Indian retail ranges (Rakhi ₹99–₹499, RC toys ₹799–₹2,499), or leave placeholders? I'll default to **realistic INR pricing** unless you say otherwise.