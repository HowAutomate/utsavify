import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-utsavify.jpg";

// Rakhi singles (used as primary product images)
import rakhiPeacock from "@/assets/rakhi/single/IMG_20260419_094121.jpg";
import rakhiPeacockAlt from "@/assets/rakhi/single/IMG_20260419_094128.jpg";
import rakhiRudraksh from "@/assets/rakhi/single/IMG_20260419_094750.jpg";
import rakhiEvilEye from "@/assets/rakhi/single/IMG_20260419_094925.jpg";
import rakhiElephant from "@/assets/rakhi/single/IMG_20260419_095609.jpg";
import rakhiGanesh from "@/assets/rakhi/single/IMG_20260419_095914.jpg";
import rakhiPearl from "@/assets/rakhi/single/IMG_20260419_100137.jpg";
import rakhiKundan from "@/assets/rakhi/single/IMG_20260419_100420.jpg";
import rakhiBracelet from "@/assets/rakhi/single/IMG_20260419_101513.jpg";
import rakhiLumba from "@/assets/rakhi/single/IMG_20260419_102233.jpg";

// Combo flat-lays
import combo1 from "@/assets/rakhi/combos/Combo_1.jpg";
import combo3 from "@/assets/rakhi/combos/Combo_3.jpg";
import combo5 from "@/assets/rakhi/combos/Combo_5.jpg";
import combo7 from "@/assets/rakhi/combos/Combo_7.jpg";
import combo9 from "@/assets/rakhi/combos/Combo_9.jpg";
import combo11 from "@/assets/rakhi/combos/Combo_11.jpg";

// Toys
import toyHeli from "@/assets/toys/rc-helicopter.jpg";
import toyTruck from "@/assets/toys/rc-truck.jpg";
import toyCar from "@/assets/toys/rc-car.jpg";
import toyExcavator from "@/assets/toys/rc-excavator.jpg";
import toyTeddy from "@/assets/toys/teddy.jpg";
import toyBlocks from "@/assets/toys/blocks.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Utsavify — Rakhi & Toys for Every Celebration" },
      {
        name: "description",
        content:
          "Shop handcrafted rakhis and joyful toys at Utsavify. From traditional Raksha Bandhan threads to remote-control helicopters, trucks and cars — delivered across India.",
      },
      { property: "og:title", content: "Utsavify — Rakhi & Toys" },
      {
        property: "og:description",
        content: "Tie the bond. Spark the joy. Festive rakhis & playful toys, in one place.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter:wght@400;500;600;700&family=Tiro+Devanagari+Hindi&display=swap",
      },
    ],
  }),
});

const featuredRakhis = [
  { name: "Mor Pankh Peacock Rakhi", series: "Designer", price: "₹249", img: rakhiPeacock, badge: "Bestseller" },
  { name: "Rudraksh Sandalwood Rakhi", series: "Spiritual", price: "₹199", img: rakhiRudraksh, badge: null },
  { name: "Evil Eye Nazar Rakhi", series: "Protection", price: "₹179", img: rakhiEvilEye, badge: "New" },
  { name: "Royal Elephant Brass Rakhi", series: "Heritage", price: "₹299", img: rakhiElephant, badge: null },
  { name: "Ganesh Ji Blessing Rakhi", series: "Devotional", price: "₹229", img: rakhiGanesh, badge: null },
  { name: "Pearl & Kundan Rakhi", series: "Premium", price: "₹349", img: rakhiPearl, badge: "Premium" },
  { name: "Royal Kundan Stone Rakhi", series: "Premium", price: "₹399", img: rakhiKundan, badge: null },
  { name: "Velvet Bracelet Rakhi", series: "Modern", price: "₹279", img: rakhiBracelet, badge: null },
];

const featuredToys = [
  { name: "Sky Cruiser RC Helicopter", series: "3.5-Channel", price: "₹1,499", img: toyHeli, badge: "Bestseller" },
  { name: "Off-Road Monster Truck", series: "RC Rally", price: "₹1,299", img: toyTruck, badge: null },
  { name: "Turbo Lambo Sports Car", series: "RC Racer", price: "₹1,099", img: toyCar, badge: "New" },
  { name: "Mighty JCB Excavator", series: "Construction", price: "₹999", img: toyExcavator, badge: null },
  { name: "Bow-Tie Teddy Bear (Large)", series: "Plush", price: "₹699", img: toyTeddy, badge: null },
  { name: "Rainbow Wooden Blocks", series: "Educational", price: "₹599", img: toyBlocks, badge: null },
];

const comboSets = [
  { img: combo1, name: "Brothers' Trio Set", count: "3 Rakhis", price: "₹549" },
  { img: combo3, name: "Family Bond Pack", count: "5 Rakhis", price: "₹849" },
  { img: combo5, name: "Bhaiya Bhabhi Lumba Set", count: "2 Rakhis", price: "₹449" },
  { img: combo7, name: "Kids Cartoon Combo", count: "4 Rakhis", price: "₹399" },
  { img: combo9, name: "Premium Kundan Duo", count: "2 Rakhis", price: "₹599" },
  { img: combo11, name: "Festive Big Family Pack", count: "7 Rakhis", price: "₹1,099" },
];

function GoldRule() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-gold" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-10 bg-gold" />
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-ink">
      {/* Promo Bar */}
      <div className="bg-maroon px-4 py-2 text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-ivory">
        Free shipping on orders above ₹499 · Raksha Bandhan delivery — order by Aug 5
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Utsav<span className="italic text-saffron">ify</span>
            </span>
          </a>
          <div className="hidden gap-9 text-sm font-semibold tracking-wide md:flex">
            <a href="#rakhi" className="transition-colors hover:text-saffron">Rakhi</a>
            <a href="#toys" className="transition-colors hover:text-saffron">Toys</a>
            <a href="#combos" className="transition-colors hover:text-saffron">Gift Sets</a>
            <a href="#track" className="transition-colors hover:text-saffron">Track Order</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="hidden size-10 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-saffron hover:text-saffron md:inline-flex"
            >
              ⌕
            </button>
            <button className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron">
              Cart · 0
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="order-2 md:order-1">
            <p className="mb-4 font-script text-lg text-maroon">रक्षा बंधन · 2026</p>
            <GoldRule />
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink md:text-7xl">
              Tie the bond. <br />
              <span className="italic text-saffron">Spark the joy.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Handcrafted rakhis and joyful toys, curated for every brother, sister and little one
              in your family. Delivered fresh, on time, all across India.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#rakhi"
                className="rounded-full bg-saffron px-8 py-4 font-display text-lg font-semibold text-ivory transition-transform hover:-translate-y-0.5"
              >
                Shop Rakhi →
              </a>
              <a
                href="#toys"
                className="rounded-full border border-maroon bg-transparent px-8 py-4 font-display text-lg font-semibold text-maroon transition-colors hover:bg-maroon hover:text-ivory"
              >
                Shop Toys
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span>✦ 100% Handpicked</span>
              <span>✦ Pan-India Shipping</span>
              <span>✦ COD Available</span>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full rounded-2xl bg-gold/40" />
              <img
                src={heroImg}
                alt="Festive thali with rakhis, diya, kumkum and a remote control helicopter beside a wrapped gift box"
                width={1280}
                height={1280}
                className="relative z-10 aspect-square w-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 left-6 z-20 hidden items-center gap-3 rounded-full bg-ink px-5 py-3 text-ivory md:flex">
                <span className="size-2 animate-pulse rounded-full bg-gold" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  New 2026 Collection · Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual category panels */}
      <section className="border-y border-border bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
          <a
            href="#rakhi"
            className="group relative overflow-hidden border-b border-border md:border-b-0 md:border-r"
          >
            <img
              src={rakhiPeacockAlt}
              alt="Rakhi collection"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon/85 via-maroon/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-ivory">
              <p className="mb-2 font-script text-base text-gold">शुभ बंधन</p>
              <h3 className="font-display text-4xl font-extrabold md:text-5xl">Rakhi Collection</h3>
              <p className="mt-2 max-w-sm text-sm opacity-90">
                Designer, Rudraksh, Lumba and Kundan rakhis from ₹179.
              </p>
              <span className="mt-5 inline-block border-b border-gold pb-1 text-xs font-semibold uppercase tracking-widest">
                Explore Rakhis →
              </span>
            </div>
          </a>
          <a href="#toys" className="group relative overflow-hidden">
            <img
              src={toyHeli}
              alt="Toys collection"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-ivory">
              <p className="mb-2 font-script text-base text-gold">मस्ती का खज़ाना</p>
              <h3 className="font-display text-4xl font-extrabold md:text-5xl">Toys & RC</h3>
              <p className="mt-2 max-w-sm text-sm opacity-90">
                Helicopters, monster trucks, supercars and excavators — power up the playroom.
              </p>
              <span className="mt-5 inline-block border-b border-gold pb-1 text-xs font-semibold uppercase tracking-widest">
                Explore Toys →
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Featured Rakhis */}
      <section id="rakhi" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-script text-lg text-maroon">रक्षा बंधन संग्रह</p>
            <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              The Rakhi Edit
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Handpicked threads of love — from sacred Rudraksh to dazzling Kundan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Designer", "Spiritual", "Premium", "Lumba", "Kids"].map((t, i) => (
              <button
                key={t}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  i === 0
                    ? "border-saffron bg-saffron text-ivory"
                    : "border-border text-ink hover:border-saffron hover:text-saffron"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {featuredRakhis.map((p) => (
            <article key={p.name} className="group">
              <div className="relative mb-4 overflow-hidden rounded-xl bg-muted">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ivory">
                    {p.badge}
                  </span>
                )}
                <button
                  className="absolute bottom-3 right-3 translate-y-2 rounded-full bg-saffron px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  aria-label={`Add ${p.name} to cart`}
                >
                  + Cart
                </button>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-saffron">
                {p.series}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-ink">{p.name}</h3>
              <p className="mt-1 text-sm font-semibold text-maroon">{p.price}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Combo / Family Sets */}
      <section
        id="combos"
        className="border-y border-border bg-gradient-to-br from-maroon to-ink py-20 text-ivory"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-script text-lg text-gold">परिवार के लिए</p>
              <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                Family Combo Sets
              </h2>
              <p className="mt-2 max-w-md text-sm text-ivory/70">
                One pack, everyone covered. For brothers, bhabhis and the little ones.
              </p>
            </div>
            <a
              href="#"
              className="rounded-full border border-gold/60 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              View all sets →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {comboSets.map((c) => (
              <article key={c.name} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl bg-ivory/5">
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                      {c.count}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{c.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-gold">{c.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Toys */}
      <section id="toys" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-script text-lg text-maroon">खिलौनों की दुनिया</p>
            <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              Power Up Playtime
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Remote-control rides and timeless classics — built for big imaginations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Remote Control", "Construction", "Plush", "Educational"].map((t, i) => (
              <button
                key={t}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  i === 0
                    ? "border-maroon bg-maroon text-ivory"
                    : "border-border text-ink hover:border-maroon hover:text-maroon"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {featuredToys.map((p) => (
            <article key={p.name} className="group">
              <div className="relative mb-4 overflow-hidden rounded-xl bg-muted">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-saffron px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ivory">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-maroon">
                    {p.series}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-ink">{p.name}</h3>
                </div>
                <p className="shrink-0 text-base font-semibold text-ink">{p.price}</p>
              </div>
              <button className="mt-4 w-full rounded-full border border-ink py-3 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-ivory">
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Festive promo */}
      <section className="bg-saffron px-6 py-16 text-ivory">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="font-script text-lg text-ivory/80">शुभ अवसर</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight md:text-5xl">
              Order by Aug 5 for <br className="hidden md:block" />
              guaranteed Raksha Bandhan delivery.
            </h2>
          </div>
          <a
            href="#rakhi"
            className="rounded-full bg-ivory px-8 py-4 font-display text-lg font-semibold text-saffron transition-transform hover:-translate-y-0.5"
          >
            Shop Now →
          </a>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { t: "Cash on Delivery", s: "Available across India" },
            { t: "Pan-India Shipping", s: "Free above ₹499" },
            { t: "Secure Payments", s: "UPI · Cards · Wallets" },
            { t: "Easy Returns", s: "7-day hassle free" },
          ].map((f) => (
            <div key={f.t} className="bg-ivory px-6 py-8 text-center">
              <p className="font-display text-base font-semibold text-ink">{f.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section id="track" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <GoldRule />
        <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Be the first to know.
        </h2>
        <p className="mt-3 text-muted-foreground">
          New rakhi drops, toy launches and festive offers — straight to your inbox.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-full border border-ink"
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="bg-ink px-7 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron">
            Subscribe
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-ink px-6 py-16 text-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-3xl font-extrabold">
              Utsav<span className="italic text-saffron">ify</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              Celebrating Indian festivals with handpicked rakhis, joyful toys and timeless gifts.
              Made for families, delivered with love.
            </p>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="#rakhi" className="hover:text-saffron">Rakhis</a></li>
              <li><a href="#toys" className="hover:text-saffron">Toys & RC</a></li>
              <li><a href="#combos" className="hover:text-saffron">Combo Sets</a></li>
              <li><a href="#" className="hover:text-saffron">Gift Hampers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Help
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="#" className="hover:text-saffron">Track Order</a></li>
              <li><a href="#" className="hover:text-saffron">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-saffron">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-saffron">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="#" className="hover:text-saffron">Instagram</a></li>
              <li><a href="#" className="hover:text-saffron">WhatsApp</a></li>
              <li><a href="#" className="hover:text-saffron">Facebook</a></li>
              <li><a href="#" className="hover:text-saffron">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-ivory/40 md:flex-row">
          <p>© 2026 Utsavify Retail Pvt. Ltd. All rights reserved.</p>
          <p className="font-script text-base text-gold">शुभकामनाएँ ✦ Made in India</p>
        </div>
      </footer>
    </div>
  );
}
