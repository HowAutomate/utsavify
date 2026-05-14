import { createFileRoute } from "@tanstack/react-router";
import heroFigure from "@/assets/hero-figure.jpg";
import productTanjiro from "@/assets/product-tanjiro.jpg";
import productVegeta from "@/assets/product-vegeta.jpg";
import productSasuke from "@/assets/product-sasuke.jpg";
import catDragonball from "@/assets/cat-dragonball.jpg";
import catDemonslayer from "@/assets/cat-demonslayer.jpg";
import catNaruto from "@/assets/cat-naruto.jpg";
import catOnepiece from "@/assets/cat-onepiece.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KaijuCore — The Ultimate Anime Collector's Hub" },
      {
        name: "description",
        content:
          "Premium anime action figures and collectibles. From Saiyans to Slayers — hand-painted, numbered, and battle-ready.",
      },
      { property: "og:title", content: "KaijuCore — Anime Collectibles" },
      { property: "og:description", content: "From Saiyans to Slayers and everything in between." },
      { property: "og:image", content: heroFigure },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;700;900&display=swap",
      },
    ],
  }),
});

const categories = [
  { name: "Dragon Ball", tag: "Z-Warriors", img: catDragonball, hover: "group-hover:bg-brand-orange" },
  { name: "Demon Slayer", tag: "Slayers", img: catDemonslayer, hover: "group-hover:bg-purple-600" },
  { name: "Naruto", tag: "Shinobi", img: catNaruto, hover: "group-hover:bg-blue-600" },
  { name: "One Piece", tag: "Pirates", img: catOnepiece, hover: "group-hover:bg-brand-yellow" },
];

const products = [
  {
    series: "Demon Slayer",
    name: "Kamado Tanjiro: Hinokami",
    price: "$189.00",
    img: productTanjiro,
    badge: { label: "Sold Out", className: "bg-brand-black text-white" },
    cta: "Add to Stash",
    accent: false,
  },
  {
    series: "Dragon Ball Z",
    name: "Prince of Saiyans: Vegeta",
    price: "$245.00",
    img: productVegeta,
    badge: { label: "Pre-Order", className: "bg-brand-yellow text-brand-black" },
    cta: "Reserve Now",
    accent: true,
  },
  {
    series: "Naruto Shippuden",
    name: "Uchiha Sasuke: Susano'o",
    price: "$210.00",
    img: productSasuke,
    badge: null,
    cta: "Add to Stash",
    accent: false,
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-black">
      {/* Promo Bar */}
      <div className="bg-brand-orange py-2 px-4 text-center text-xs font-bold tracking-widest uppercase text-white">
        Limited Edition: SSJ4 Goku Statue Drops in 04:22:10 — Only 500 Pieces
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b-4 border-brand-black bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="/" className="font-display text-3xl uppercase italic tracking-tighter">
            KAIJU<span className="text-brand-orange">CORE</span>
          </a>
          <div className="hidden gap-8 text-sm font-bold uppercase tracking-wider md:flex">
            <a href="#new" className="transition-colors hover:text-brand-orange">New Arrivals</a>
            <a href="#series" className="transition-colors hover:text-brand-orange">Series</a>
            <a href="#exclusives" className="transition-colors hover:text-brand-orange">Exclusives</a>
            <a href="#preorders" className="transition-colors hover:text-brand-orange">Pre-Orders</a>
          </div>
          <div className="flex items-center gap-6">
            <button aria-label="Search" className="size-5 border-2 border-brand-black" />
            <button className="bg-brand-black px-4 py-1.5 text-sm font-bold text-white">CART (0)</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b-4 border-brand-black">
        <div className="flex flex-col md:flex-row">
          <div className="flex w-full flex-col justify-center border-brand-black p-8 md:w-1/2 md:border-r-4 md:p-16">
            <span className="mb-6 inline-block w-fit bg-brand-yellow px-3 py-1 text-xs font-bold uppercase tracking-widest">
              Legendary Series 01
            </span>
            <h1 className="mb-8 font-display text-7xl uppercase leading-[0.85] md:text-9xl">
              ASCEND TO <br />
              <span className="text-brand-orange">GODHOOD</span>
            </h1>
            <p className="mb-10 max-w-md text-lg font-medium leading-relaxed text-brand-black/70">
              The definitive 1/4 scale collection featuring the most iconic moments in Shonen
              history. Hand-painted, numbered, and battle-ready.
            </p>
            <button className="w-fit bg-brand-black px-12 py-5 font-display text-2xl uppercase text-white transition-colors hover:bg-brand-orange">
              Explore Collection
            </button>
          </div>
          <div className="w-full bg-stone-100 md:w-1/2">
            <img
              src={heroFigure}
              alt="Saiyan warrior collectible figure with energy sword"
              width={1024}
              height={1152}
              className="h-full min-h-[500px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="series" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-5xl uppercase italic">Choose Your Universe</h2>
          <a href="#" className="border-b-2 border-brand-black pb-1 text-xs font-bold uppercase">
            View All Series
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <a key={c.name} href="#" className="group cursor-pointer">
              <div
                className={`relative mb-4 aspect-square overflow-hidden border-2 border-brand-black bg-stone-100 transition-colors ${c.hover}`}
              >
                <img
                  src={c.img}
                  alt={`${c.name} category`}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 bg-brand-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                  {c.tag}
                </span>
              </div>
              <p className="font-display text-xl uppercase">{c.name}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section id="new" className="border-t-4 border-brand-black bg-stone-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-6xl uppercase leading-none">HIGH POWER LEVELS</h2>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-black/60">
                Current trending collectibles
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Scale Figures", "Nendoroids", "Statues"].map((t) => (
                <button
                  key={t}
                  className="border-2 border-brand-black px-6 py-2 text-xs font-bold uppercase transition-colors hover:bg-brand-black hover:text-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {products.map((p) => (
              <article key={p.name} className="group">
                <div className="relative mb-6">
                  <div
                    className={`aspect-[4/5] overflow-hidden border-2 border-brand-black bg-white ${
                      p.accent ? "shadow-[8px_8px_0px_0px_var(--brand-orange)]" : ""
                    }`}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      width={768}
                      height={960}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {p.badge && (
                    <div
                      className={`absolute left-4 top-4 px-3 py-1 text-[10px] font-bold uppercase italic tracking-tighter ${p.badge.className}`}
                    >
                      {p.badge.label}
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase text-brand-orange">{p.series}</p>
                    <h3 className="font-display text-2xl uppercase transition-colors group-hover:text-brand-orange">
                      {p.name}
                    </h3>
                  </div>
                  <p className="font-bold">{p.price}</p>
                </div>
                <button className="mt-6 w-full border-2 border-brand-black py-4 font-display text-lg uppercase transition-all hover:bg-brand-black hover:text-white active:scale-95">
                  {p.cta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative overflow-hidden bg-brand-black py-20 text-white">
        <div className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 select-none whitespace-nowrap font-display text-[20rem] uppercase italic text-white/5">
          COLLECT EVERYTHING COLLECT EVERYTHING
        </div>
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
          <h2 className="mb-6 font-display text-7xl uppercase italic md:text-9xl">JOIN THE CORPS</h2>
          <p className="mb-10 text-lg font-bold uppercase italic tracking-[0.2em] text-brand-yellow">
            Unlock 15% off your first legendary purchase
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-xl border-4 border-white"
          >
            <input
              type="email"
              required
              placeholder="YOUR@EMAIL.COM"
              className="flex-1 bg-transparent px-6 py-4 text-sm font-bold uppercase outline-none placeholder:text-white/30"
            />
            <button className="bg-white px-10 py-4 font-display text-xl uppercase text-brand-black transition-colors hover:bg-brand-orange hover:text-white">
              Submit
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-brand-black px-6 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4">
          <div>
            <div className="mb-6 font-display text-2xl uppercase italic">
              KAIJU<span className="text-brand-orange">CORE</span>
            </div>
            <p className="text-xs font-bold uppercase leading-loose tracking-tighter text-brand-black/50">
              Est. 2024. Curating the finest battle-grade collectibles for the true otaku. From the
              Tokyo streets to your shelf.
            </p>
          </div>
          <div>
            <h4 className="mb-6 font-display text-lg uppercase">Intel</h4>
            <ul className="space-y-3 text-xs font-bold uppercase">
              <li><a href="#" className="hover:text-brand-orange">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-brand-orange">Authenticity Check</a></li>
              <li><a href="#" className="hover:text-brand-orange">Pre-order FAQ</a></li>
              <li><a href="#" className="hover:text-brand-orange">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-display text-lg uppercase">Socials</h4>
            <ul className="space-y-3 text-xs font-bold uppercase">
              <li><a href="#" className="hover:text-brand-orange">Instagram</a></li>
              <li><a href="#" className="hover:text-brand-orange">TikTok</a></li>
              <li><a href="#" className="hover:text-brand-orange">Discord</a></li>
              <li><a href="#" className="hover:text-brand-orange">Twitter / X</a></li>
            </ul>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl uppercase leading-[0.8]">
              STAY <br />
              <span className="text-brand-orange">POWERED UP</span>
            </p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-black/30">
              © 2024 KaijuCore Collectibles Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
