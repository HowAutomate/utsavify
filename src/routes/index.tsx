import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import heroImg from "@/assets/hero-utsavify.jpg";
import logoImg from "@/assets/utsavify-logo.png";

// Rakhi singles
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

// Combos
import combo1 from "@/assets/rakhi/combos/Combo_1.jpg";
import combo3 from "@/assets/rakhi/combos/Combo_3.jpg";
import combo5 from "@/assets/rakhi/combos/Combo_5.jpg";
import combo7 from "@/assets/rakhi/combos/Combo_7.jpg";
import combo9 from "@/assets/rakhi/combos/Combo_9.jpg";
import combo11 from "@/assets/rakhi/combos/Combo_11.jpg";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Utsavify — Handcrafted Rakhis for Raksha Bandhan 2026" },
      {
        name: "description",
        content:
          "Shop handcrafted rakhis at Utsavify — Designer, Rudraksh, Kundan, Lumba and Family Combo Sets. Delivered fresh across India for Raksha Bandhan.",
      },
      { property: "og:title", content: "Utsavify — Handcrafted Rakhis" },
      {
        property: "og:description",
        content: "Tie the bond. Handpicked rakhis and combo sets for every brother, sister and bhabhi.",
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

type Product = {
  id: string;
  name: string;
  series: string;
  category: string;
  priceNum: number;
  img: string;
  badge?: string | null;
  description?: string;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const featuredRakhis: Product[] = [
  { id: "r1", name: "Mor Pankh Peacock Rakhi", series: "Designer", category: "Designer", priceNum: 249, img: rakhiPeacock, badge: "Bestseller" },
  { id: "r2", name: "Peacock Designer Rakhi", series: "Designer", category: "Designer", priceNum: 199, img: rakhiRudraksh },
  { id: "r3", name: "Om Sacred Name Rakhi", series: "Spiritual", category: "Spiritual", priceNum: 179, img: rakhiEvilEye, badge: "New" },
  { id: "r4", name: "Royal Elephant Brass Rakhi", series: "Heritage", category: "Designer", priceNum: 299, img: rakhiElephant },
  { id: "r5", name: "Ganesh Ji Blessing Rakhi", series: "Devotional", category: "Spiritual", priceNum: 229, img: rakhiGanesh },
  { id: "r6", name: "Pearl & Kundan Rakhi", series: "Premium", category: "Premium", priceNum: 349, img: rakhiPearl, badge: "Premium" },
  { id: "r7", name: "Royal Kundan Stone Rakhi", series: "Premium", category: "Premium", priceNum: 399, img: rakhiKundan },
  { id: "r8", name: "Velvet Bracelet Rakhi", series: "Modern", category: "Designer", priceNum: 279, img: rakhiBracelet },
  { id: "r9", name: "Bhaiya Bhabhi Lumba Rakhi", series: "Lumba", category: "Lumba", priceNum: 329, img: rakhiLumba },
];

const comboSets: Product[] = [
  { id: "c1", name: "Brothers' Trio Set", series: "3 Rakhis", category: "Combo", priceNum: 549, img: combo1 },
  { id: "c2", name: "Family Bond Pack", series: "5 Rakhis", category: "Combo", priceNum: 849, img: combo3 },
  { id: "c3", name: "Bhaiya Bhabhi Lumba Set", series: "2 Rakhis", category: "Combo", priceNum: 449, img: combo5 },
  { id: "c4", name: "Kids Cartoon Combo", series: "4 Rakhis", category: "Combo", priceNum: 399, img: combo7 },
  { id: "c5", name: "Premium Kundan Duo", series: "2 Rakhis", category: "Combo", priceNum: 599, img: combo9 },
  { id: "c6", name: "Festive Big Family Pack", series: "7 Rakhis", category: "Combo", priceNum: 1099, img: combo11 },
];

const rakhiFilters = ["All", "Designer", "Spiritual", "Premium", "Lumba"];

type CartItem = Product & { qty: number };

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [rakhiFilter, setRakhiFilter] = useState("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    payment: "cod",
    notes: "",
  });

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !address.fullName ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      toast.error("Please fill all required address fields");
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    toast.success("Order placed!", {
      description: `Shipping to ${address.fullName}, ${address.city}. ${address.payment === "cod" ? "Cash on Delivery" : "Prepaid"} · ${inr(cartTotal)}`,
    });
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.priceNum * i.qty, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
    toast.success("Added to cart", { description: p.name });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );

  const visibleRakhis = useMemo(
    () => (rakhiFilter === "All" ? featuredRakhis : featuredRakhis.filter((p) => p.category === rakhiFilter)),
    [rakhiFilter],
  );

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    if (!email) return;
    toast.success("Subscribed!", { description: `We'll send updates to ${email}` });
    form.reset();
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-ink">
      {/* Promo Bar */}
      <div className="bg-maroon px-3 py-2 text-center text-[10px] font-semibold tracking-[0.15em] uppercase text-ivory sm:text-[11px] sm:tracking-[0.2em]">
        Free shipping above ₹499 · Order by Aug 5 for Raksha Bandhan
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <a href="/" className="flex items-center" aria-label="Utsavify home">
            <img src={logoImg} alt="Utsavify — Celebrate Every Moment" className="h-16 w-auto md:h-20" />
          </a>
          <div className="hidden gap-9 text-sm font-semibold tracking-wide md:flex">
            <button onClick={() => scrollTo("rakhi")} className="transition-colors hover:text-saffron">Rakhi</button>
            <button onClick={() => scrollTo("combos")} className="transition-colors hover:text-saffron">Gift Sets</button>
            <button onClick={() => scrollTo("contact")} className="transition-colors hover:text-saffron">Contact</button>
            <button onClick={() => scrollTo("track")} className="transition-colors hover:text-saffron">Newsletter</button>
          </div>
          <div className="flex items-center gap-3">
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <button className="rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron md:px-5 md:py-2.5 md:text-xs">
                  Cart · {cartCount}
                </button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col bg-ivory sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Your cart is empty. Add some festive picks!
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {cart.map((item) => (
                        <li key={item.id} className="flex gap-4 rounded-lg border border-border bg-card p-3">
                          <img src={item.img} alt={item.name} className="size-20 shrink-0 rounded-md object-cover" />
                          <div className="flex flex-1 flex-col">
                            <p className="font-display text-sm font-semibold leading-tight text-ink">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.series}</p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(item.id, -1)}
                                  className="size-7 rounded-full border border-border text-sm hover:border-saffron"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                                <button
                                  onClick={() => updateQty(item.id, 1)}
                                  className="size-7 rounded-full border border-border text-sm hover:border-saffron"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-maroon">
                                {inr(item.priceNum * item.qty)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="self-start text-xs text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="mb-4 flex items-center justify-between font-display text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-maroon">{inr(cartTotal)}</span>
                    </div>
                    <button
                      onClick={() => setCheckoutOpen(true)}
                      className="w-full rounded-full bg-saffron py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
                    >
                      Checkout · {inr(cartTotal)}
                    </button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-6 md:py-24">
          <div className="order-2 md:order-1">
            <p className="mb-4 font-script text-lg text-maroon">रक्षा बंधन · 2026</p>
            <GoldRule />
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-7xl">
              Tie the bond. <br />
              <span className="italic text-saffron">Spark the joy.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Handcrafted rakhis curated for every brother, sister and bhabhi in your family.
              Delivered fresh, on time, all across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
              <button
                onClick={() => scrollTo("rakhi")}
                className="rounded-full bg-saffron px-6 py-3 font-display text-base font-semibold text-ivory transition-transform hover:-translate-y-0.5 md:px-8 md:py-4 md:text-lg"
              >
                Shop Rakhi →
              </button>
              <button
                onClick={() => scrollTo("combos")}
                className="rounded-full border border-maroon bg-transparent px-6 py-3 font-display text-base font-semibold text-maroon transition-colors hover:bg-maroon hover:text-ivory md:px-8 md:py-4 md:text-lg"
              >
                Family Combos
              </button>
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
          <button
            onClick={() => scrollTo("rakhi")}
            className="group relative overflow-hidden border-b border-border text-left md:border-b-0 md:border-r"
          >
            <img
              src={rakhiPeacockAlt}
              alt="Rakhi collection"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-[280px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[420px]"
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
          </button>
          <button onClick={() => scrollTo("combos")} className="group relative overflow-hidden text-left">
            <img
              src={combo1}
              alt="Family combo rakhi sets"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-[280px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-ivory md:p-8">
              <p className="mb-2 font-script text-base text-gold">परिवार के लिए</p>
              <h3 className="font-display text-4xl font-extrabold md:text-5xl">Family Combo Sets</h3>
              <p className="mt-2 max-w-sm text-sm opacity-90">
                Trio, family and Bhaiya-Bhabhi packs — one box, everyone covered.
              </p>
              <span className="mt-5 inline-block border-b border-gold pb-1 text-xs font-semibold uppercase tracking-widest">
                Explore Sets →
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Featured Rakhis */}
      <section id="rakhi" className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
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
            {rakhiFilters.map((t) => (
              <button
                key={t}
                onClick={() => setRakhiFilter(t)}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  rakhiFilter === t
                    ? "border-saffron bg-saffron text-ivory"
                    : "border-border text-ink hover:border-saffron hover:text-saffron"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {visibleRakhis.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No rakhis in this category yet. Try another filter.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {visibleRakhis.map((p) => (
              <article key={p.id} className="group">
                <button
                  onClick={() => setSelected(p)}
                  className="relative mb-4 block w-full overflow-hidden rounded-xl bg-muted text-left"
                  aria-label={`View ${p.name}`}
                >
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
                </button>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-saffron">
                  {p.series}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-ink">{p.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-maroon">{inr(p.priceNum)}</p>
                  <button
                    onClick={() => addToCart(p)}
                    className="rounded-full bg-saffron px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
                  >
                    + Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Combo / Family Sets */}
      <section
        id="combos"
        className="border-y border-border bg-gradient-to-br from-maroon to-ink py-12 text-ivory md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
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
            <button
              onClick={() => scrollTo("rakhi")}
              className="rounded-full border border-gold/60 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              View all sets →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {comboSets.map((c) => (
              <article key={c.id} className="group">
                <button
                  onClick={() => setSelected(c)}
                  className="block w-full overflow-hidden rounded-xl bg-ivory/5"
                >
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                      {c.series}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{c.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-gold">{inr(c.priceNum)}</p>
                </div>
                <button
                  onClick={() => addToCart(c)}
                  className="mt-3 w-full rounded-full border border-gold/60 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  Add Combo
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-y border-border bg-ivory px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-script text-lg text-maroon">संपर्क करें</p>
            <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              We'd love to hear from you.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Questions about a rakhi, a combo, or your order? Reach us directly — we usually reply within a few hours.
            </p>
            <div className="mt-8 space-y-5">
              <a href="tel:+918058606454" className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-saffron text-ivory font-display text-lg">☎</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Call / WhatsApp</span>
                  <span className="block font-display text-lg font-semibold text-ink group-hover:text-saffron">+91 80586 06454</span>
                </span>
              </a>
              <a href="mailto:hello@utsavify.com" className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-maroon text-ivory font-display text-lg">✉</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
                  <span className="block font-display text-lg font-semibold text-ink group-hover:text-maroon">hello@utsavify.com</span>
                </span>
              </a>
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-ink text-ivory font-display text-lg">⏱</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Hours</span>
                  <span className="block font-display text-lg font-semibold text-ink">Mon–Sat · 10am – 7pm IST</span>
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
            <h3 className="font-display text-2xl font-semibold text-ink">Send us a message</h3>
            <p className="mt-1 text-sm text-muted-foreground">Or drop a quick note — we'll get back over email.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent!", { description: "We'll reply to your email shortly." });
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-6 space-y-4"
            >
              <Input name="name" placeholder="Your name" required />
              <Input name="email" type="email" placeholder="Email address" required />
              <Textarea name="message" placeholder="How can we help?" rows={4} required />
              <button
                type="submit"
                className="w-full rounded-full bg-saffron py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Festive promo */}
      <section className="bg-saffron px-4 py-12 text-ivory md:px-6 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-script text-lg text-ivory/80">शुभ अवसर</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl md:text-5xl">
              Order by Aug 5 for <br className="hidden md:block" />
              guaranteed Raksha Bandhan delivery.
            </h2>
          </div>
          <button
            onClick={() => scrollTo("rakhi")}
            className="rounded-full bg-ivory px-8 py-4 font-display text-lg font-semibold text-saffron transition-transform hover:-translate-y-0.5"
          >
            Shop Now →
          </button>
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
      <section id="track" className="mx-auto max-w-3xl px-4 py-12 text-center md:px-6 md:py-20">
        <div className="flex justify-center"><GoldRule /></div>
        <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
          Be the first to know.
        </h2>
        <p className="mt-3 text-muted-foreground">
          New rakhi drops, combo sets and festive offers — straight to your inbox.
        </p>
        <form
          onSubmit={handleSubscribe}
          className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-full border border-ink"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="bg-ink px-7 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-ink px-4 py-12 text-ivory md:px-6 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-3xl font-extrabold">
              Utsav<span className="italic text-saffron">ify</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              Celebrating Raksha Bandhan with handpicked rakhis, combo sets and timeless gifts.
              Made for families, delivered with love.
            </p>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><button onClick={() => scrollTo("rakhi")} className="hover:text-saffron">Rakhis</button></li>
              <li><button onClick={() => scrollTo("combos")} className="hover:text-saffron">Combo Sets</button></li>
              <li><button onClick={() => scrollTo("contact")} className="hover:text-saffron">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Help
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="mailto:hello@utsavify.com" className="hover:text-saffron">hello@utsavify.com</a></li>
              <li><a href="tel:+918058606454" className="hover:text-saffron">+91 80586 06454</a></li>
              <li>Mon–Sat · 10am–7pm IST</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li>Instagram · @utsavify</li>
              <li><a href="https://wa.me/918058606454" className="hover:text-saffron">WhatsApp · +91 80586 06454</a></li>
              <li>Facebook · /utsavify</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-ivory/40 md:flex-row">
          <p>© 2026 Utsavify Retail Pvt. Ltd. All rights reserved.</p>
          <p className="font-script text-base text-gold">शुभकामनाएँ ✦ Made in India</p>
        </div>
      </footer>

      {/* Product Quick View */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl bg-ivory p-0">
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <img
                src={selected.img}
                alt={selected.name}
                className="h-full max-h-[420px] w-full object-cover md:rounded-l-lg"
              />
              <div className="flex flex-col p-6">
                <DialogHeader>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-saffron">
                    {selected.series}
                  </p>
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    {selected.name}
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-3 text-sm text-muted-foreground">
                  Handpicked, festival-ready and delivered across India. Pair it with a combo
                  pack and save more.
                </p>
                <p className="mt-4 font-display text-3xl font-extrabold text-maroon">
                  {inr(selected.priceNum)}
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-6">
                  <button
                    onClick={() => {
                      addToCart(selected);
                      setSelected(null);
                    }}
                    className="w-full rounded-full bg-saffron py-3 text-xs font-semibold uppercase tracking-widest text-ivory hover:bg-maroon"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selected);
                      setSelected(null);
                      setCartOpen(true);
                    }}
                    className="w-full rounded-full border border-ink py-3 text-xs font-semibold uppercase tracking-widest text-ink hover:bg-ink hover:text-ivory"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout / Address Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-ivory sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold text-ink">
              Shipping Address
            </DialogTitle>
            <DialogDescription>
              Enter your delivery details. We'll send your festive picks straight to your door.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Aarav Sharma"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email (for order updates)</Label>
              <Input
                id="email"
                type="email"
                value={address.email}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                required
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                placeholder="House / Flat no., Building, Street"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                value={address.line2}
                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                placeholder="Area, Colony, Sector (optional)"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="Maharashtra"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                  placeholder="400001"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={address.landmark}
                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                placeholder="Near... (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Delivery Notes</Label>
              <Textarea
                id="notes"
                value={address.notes}
                onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                placeholder="Gift wrap, leave at door, etc. (optional)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { v: "cod", label: "Cash on Delivery" },
                  { v: "upi", label: "UPI / Card (Prepaid)" },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                      address.payment === opt.v
                        ? "border-saffron bg-saffron/10"
                        : "border-border hover:border-saffron"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.v}
                      checked={address.payment === opt.v}
                      onChange={(e) => setAddress({ ...address, payment: e.target.value })}
                      className="accent-saffron"
                    />
                    <span className="font-semibold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order Total</p>
                <p className="font-display text-2xl font-extrabold text-maroon">{inr(cartTotal)}</p>
              </div>
              <button
                type="submit"
                className="rounded-full bg-saffron px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
              >
                Place Order
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
