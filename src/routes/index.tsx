import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
// Category-panel banners use sheet-hosted product images (public/products)
const rakhiCollectionImg = "/products/pearl-kundan-1.webp";
const familyComboImg = "/products/festive-big-family-pack-1.webp";
const bundleOfferImg = "/products/family-bond-pack-1.webp";
import { featuredRakhis, comboSets, mergeBySlug, inr, type Product } from "@/lib/products";
import { useCart } from "@/contexts/cart";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics";
import { useSheetProducts } from "@/hooks/use-sheet-products";
import { useSheetReviews } from "@/hooks/use-sheet-reviews";
import { summaryForSlug } from "@/lib/seed-reviews";
import { StarRating } from "@/components/star-rating";


interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayWindow extends Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    cart: search.cart as string | undefined,
  }),
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
      { rel: "canonical", href: "https://www.utsavify.com/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400;1,9..144,600;1,9..144,800&family=Inter:wght@400;500;600;700&family=Tiro+Devanagari+Hindi&display=swap",
      },
    ],
  }),
});

const rakhiFilters = ["All", "Designer", "Spiritual", "Bhaiya Bhabhi"];

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
  const { cart, cartOpen, setCartOpen, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, cartNaiveTotal, cartSavings, cartSlotsLeftInBox } = useCart();
  const { cart: cartParam } = Route.useSearch();
  const { data: sheetProducts = [] } = useSheetProducts();
  const [rakhiFilter, setRakhiFilter] = useState("All");
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
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ name: string; city: string; total: number } | null>(null);
  // Two-step checkout: 1 = contact details, 2 = address + payment.
  const [checkoutStep, setCheckoutStep] = useState(1);

  const WEBHOOK_URL =
    "https://n8n.srv1198552.hstgr.cloud/webhook/b192b116-0346-4929-a44e-0cee7ac8a7d4";
  // Contact + newsletter leads → n8n (Webhook → Gmail notify + Google Sheet log).
  const LEADS_WEBHOOK_URL =
    "https://n8n.srv1198552.hstgr.cloud/webhook/utsavify-leads";
  // Checkout-started ping → n8n abandoned-cart recovery (Workflow 5).
  const ABANDONED_CART_WEBHOOK_URL =
    "https://n8n.srv1198552.hstgr.cloud/webhook/utsavify-cart-abandoned";

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as RazorpayWindow).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  const submitOrderToWebhook = async (
    paymentMethod: string,
    razorpayPaymentId?: string,
    razorpayOrderId?: string,
  ) => {
    const fd = new FormData();
    fd.append(
      "order",
      JSON.stringify({
        address,
        items: cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.priceNum })),
        total: payableTotal,
        paymentMethod,
        razorpayPaymentId: razorpayPaymentId ?? null,
        razorpayOrderId: razorpayOrderId ?? null,
        placedAt: new Date().toISOString(),
      }),
    );
    const res = await fetch(WEBHOOK_URL, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Webhook error ${res.status}`);
  };

  // Fire-and-forget "checkout started" ping so n8n can recover abandoned carts.
  // Throttled per email so restarting checkout doesn't queue duplicate reminders.
  const notifyCheckoutStarted = () => {
    const email = address.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    try {
      const raw = localStorage.getItem("utsavify-abandon-ping");
      if (raw) {
        const last = JSON.parse(raw) as { email?: string; at?: number };
        if (last.email === email && last.at && Date.now() - last.at < 6 * 60 * 60 * 1000) return;
      }
      localStorage.setItem("utsavify-abandon-ping", JSON.stringify({ email, at: Date.now() }));
    } catch {}
    const fd = new FormData();
    fd.append("type", "checkout-started");
    fd.append("name", address.fullName);
    fd.append("email", email);
    fd.append("phone", address.phone);
    fd.append("items", JSON.stringify(cart.map((i) => ({ name: i.name, qty: i.qty, price: i.priceNum }))));
    fd.append("total", String(payableTotal));
    fd.append("startedAt", new Date().toISOString());
    fetch(ABANDONED_CART_WEBHOOK_URL, { method: "POST", body: fd }).catch(() => {});
  };

  // Step 1 → 2: validate contact fields, fire the recovery ping, advance.
  const handleContactContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address.fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(address.email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    notifyCheckoutStarted();
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
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
    if (address.payment === "cod" && cartTotal >= 500) {
      toast.error("COD is only available for orders below ₹500. Please choose prepaid.");
      return;
    }

    notifyCheckoutStarted();
    setSubmitting(true);

    if (address.payment === "cod") {
      try {
        await submitOrderToWebhook("cod");
        trackPurchase(payableTotal, "cod");
        setOrderSuccess({ name: address.fullName, city: address.city, total: payableTotal });
        clearCart();
        setCartOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Could not submit order. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Razorpay flow
    try {
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
      if (!rzpKey) {
        toast.error("Payment not configured. Please contact support.");
        setSubmitting(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load payment gateway. Please check your connection.");
        setSubmitting(false);
        return;
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payableTotal * 100, receipt: `rcpt_${Date.now()}` }),
      });
      if (!orderRes.ok) {
        let detail = "";
        try { const d = await orderRes.json(); detail = d.error ?? ""; } catch {}
        throw new Error(`Order API ${orderRes.status}${detail ? ": " + detail : ""}`);
      }
      let orderData: { order_id: string; amount: number; currency: string };
      try {
        orderData = await orderRes.json();
      } catch {
        throw new Error("Order API returned invalid response (not JSON). Check Vercel functions.");
      }
      const { order_id, amount, currency } = orderData;

      const rzp = new (window as RazorpayWindow).Razorpay({
        key: rzpKey,
        amount,
        currency,
        name: "Utsavify",
        description: "Raksha Bandhan Order",
        order_id,
        prefill: { name: address.fullName, email: address.email, contact: address.phone },
        theme: { color: "#C45A1E" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (!verifyRes.ok) {
              toast.error("Payment verification failed. Please contact support.");
              setSubmitting(false);
              return;
            }
            await submitOrderToWebhook("razorpay", response.razorpay_payment_id, response.razorpay_order_id);
            trackPurchase(payableTotal, "razorpay");
            setOrderSuccess({ name: address.fullName, city: address.city, total: payableTotal });
            clearCart();
            setCartOpen(false);
          } catch (err) {
            console.error(err);
            toast.error("Order could not be recorded. Please contact support with your payment ID.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutOpen(true);
            toast.error("Payment cancelled.");
            setSubmitting(false);
          },
        },
      });

      rzp.on("payment.failed", (response) => {
        setCheckoutOpen(true);
        toast.error(`Payment failed: ${response.error.description}`);
        setSubmitting(false);
      });

      setCheckoutOpen(false);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  const prepaidDiscount = address.payment === "razorpay" ? Math.round(cartTotal * 0.05) : 0;
  const bulkDiscount = cartTotal >= 1000 ? Math.round(cartTotal * 0.05) : 0;
  const payableTotal = cartTotal - prepaidDiscount - bulkDiscount;
  const codAvailable = cartTotal < 500;

  useEffect(() => {
    if (cartParam === "open") setCartOpen(true);
  }, []);

  const allRakhis = useMemo(
    () => mergeBySlug(featuredRakhis, sheetProducts.filter((p) => p.category !== "Combo")),
    [sheetProducts],
  );
  const allCombos = useMemo(
    () => mergeBySlug(comboSets, sheetProducts.filter((p) => p.category === "Combo")),
    [sheetProducts],
  );

  // Per-product rating summaries (seed reviews + any approved Sheet reviews).
  const { data: allReviews = [] } = useSheetReviews();
  const ratingBySlug = useMemo(() => {
    const m = new Map<string, ReturnType<typeof summaryForSlug>>();
    for (const p of [...allRakhis, ...allCombos]) {
      m.set(p.slug, summaryForSlug(p.slug, allReviews));
    }
    return m;
  }, [allRakhis, allCombos, allReviews]);
  const visibleRakhis = useMemo(
    () => (rakhiFilter === "All" ? allRakhis : allRakhis.filter((p) => p.category === rakhiFilter)),
    [rakhiFilter, allRakhis],
  );

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    if (!email) return;
    const fd = new FormData();
    fd.append("type", "subscribe");
    fd.append("email", email);
    fd.append("submittedAt", new Date().toISOString());
    try {
      const res = await fetch(LEADS_WEBHOOK_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
      toast.success("Subscribed!", { description: `We'll send festive updates to ${email}` });
      form.reset();
    } catch {
      toast.error("Couldn't subscribe", { description: "Please try again or email hello@utsavify.com" });
    }
  };

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append("type", "contact");
    fd.append("name", (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "");
    fd.append("email", (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "");
    fd.append("message", (form.elements.namedItem("message") as HTMLTextAreaElement)?.value ?? "");
    fd.append("submittedAt", new Date().toISOString());
    try {
      const res = await fetch(LEADS_WEBHOOK_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
      toast.success("Message sent!", { description: "We'll reply to your email shortly." });
      form.reset();
    } catch {
      toast.error("Couldn't send message", { description: "Please email us at hello@utsavify.com" });
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-ink">
      {/* Promo Bar — scrolling marquee */}
      <div className="overflow-hidden bg-maroon py-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-ivory sm:text-[11px] sm:tracking-[0.2em]">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="flex shrink-0 items-center gap-10 px-8">
              <span>✦ Free Delivery</span>
              <span>✦ 5% Off Prepaid</span>
              <span>✦ Extra 5% Off on ₹1000+</span>
              <span>✦ COD Below ₹500</span>
              <span>✦ Order by Aug 20 for Raksha Bandhan</span>
            </span>
          ))}
        </div>
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
            <button onClick={() => scrollTo("about")} className="transition-colors hover:text-saffron">About</button>
            <button onClick={() => scrollTo("contact")} className="transition-colors hover:text-saffron">Contact</button>
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
                    {cartSlotsLeftInBox > 0 && (
                      <div className="mb-3 rounded-lg bg-saffron/10 px-3 py-2 text-xs font-medium text-maroon">
                        🎁 Room for {cartSlotsLeftInBox} more rakhi in this box — extras ship free and cost just a <strong>small top-up</strong> each.
                      </div>
                    )}
                    {cartSavings > 0 && (
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-saffron">Bundle box savings</span>
                        <span className="font-semibold text-saffron">−{inr(cartSavings)}</span>
                      </div>
                    )}
                    <div className="mb-4 flex items-center justify-between font-display text-lg font-semibold">
                      <span>Total</span>
                      <span className="flex items-baseline gap-2">
                        {cartSavings > 0 && (
                          <span className="text-sm font-normal line-through text-muted-foreground">{inr(cartNaiveTotal)}</span>
                        )}
                        <span className="text-maroon">{inr(cartTotal)}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => { trackInitiateCheckout(cartTotal, cartCount); setCartOpen(false); setCheckoutStep(1); setCheckoutOpen(true); }}
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
              src={rakhiCollectionImg}
              alt="Rakhi collection"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[300px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon/95 via-maroon/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-ivory md:p-8">
              <p className="mb-0.5 font-script text-sm text-gold md:text-base">शुभ बंधन</p>
              <h3 className="font-display text-2xl font-extrabold md:text-4xl">Rakhi Collection</h3>
              <p className="mt-1 max-w-sm text-xs opacity-90 md:text-sm">
                Designer, Rudraksh, Lumba and Kundan rakhis from ₹149.
              </p>
              <span className="mt-3 inline-block border-b border-gold pb-0.5 text-[11px] font-semibold uppercase tracking-widest md:text-xs">
                Explore Rakhis →
              </span>
            </div>
          </button>
          <button onClick={() => scrollTo("combos")} className="group relative overflow-hidden text-left">
            <img
              src={familyComboImg}
              alt="Family combo rakhi sets"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[300px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-ivory md:p-8">
              <p className="mb-0.5 font-script text-sm text-gold md:text-base">परिवार के लिए</p>
              <h3 className="font-display text-2xl font-extrabold md:text-4xl">Family Combo Sets</h3>
              <p className="mt-1 max-w-sm text-xs opacity-90 md:text-sm">
                Trio, family and Bhaiya-Bhabhi packs — one box, everyone covered.
              </p>
              <span className="mt-3 inline-block border-b border-gold pb-0.5 text-[11px] font-semibold uppercase tracking-widest md:text-xs">
                Explore Sets →
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Box-bundle offer banner */}
      <section className="border-y border-border bg-maroon text-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch md:h-[300px] md:grid-cols-2">
          <div className="flex flex-col justify-center p-5 md:p-8">
            <p className="mb-1 font-script text-sm text-gold md:text-base">एक बॉक्स · पूरा परिवार</p>
            <h2 className="font-display text-2xl font-extrabold leading-tight md:text-4xl">
              One Box. <span className="text-saffron">Every Sibling.</span>
            </h2>
            <p className="mt-2 max-w-md text-xs opacity-90 md:text-sm">
              Add up to 4 rakhis to a single box — shipping paid once, every extra rakhi at a
              special bundle price.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold md:text-xs">
              <span>1 Box</span>
              <span className="text-ivory/40">•</span>
              <span>Up to 4 Rakhis</span>
              <span className="text-ivory/40">•</span>
              <span>Shipping Paid Once</span>
            </div>
            <button
              onClick={() => scrollTo("rakhi")}
              className="mt-4 inline-flex w-fit items-center rounded-full bg-saffron px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-ivory transition-transform hover:scale-105 md:text-xs"
            >
              Fill Your Box →
            </button>
          </div>
          <div className="relative hidden overflow-hidden md:block">
            <img
              src={bundleOfferImg}
              alt="Fill one box with up to four rakhis and save on every extra"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-maroon/80 via-maroon/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* Featured Rakhis */}
      <section id="rakhi" className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-script text-lg text-maroon">रक्षा बंधन संग्रह</p>
            <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              The Rakhi Edition
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
            <span className="cursor-not-allowed rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-50">
              Hamper · Soon
            </span>
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
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="relative mb-4 block overflow-hidden rounded-xl bg-muted"
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
                </Link>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-saffron">
                  {p.series}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-ink">{p.name}</h3>
                {(() => {
                  const s = ratingBySlug.get(p.slug);
                  return s && s.count > 0 ? (
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      hash="reviews"
                      className="mt-1.5 flex items-center gap-1.5"
                      aria-label={`${s.average} out of 5 from ${s.count} reviews`}
                    >
                      <StarRating value={s.average} className="size-3.5" />
                      <span className="text-[11px] text-muted-foreground">
                        {s.average.toFixed(1)} ({s.count})
                      </span>
                    </Link>
                  ) : null;
                })()}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                    <span className="text-sm font-semibold text-maroon">{inr(p.priceNum)}</span>
                    {p.mrp && p.mrp > p.priceNum && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
                        <span className="text-[10px] font-semibold text-saffron">
                          {Math.round((1 - p.priceNum / p.mrp) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="shrink-0 rounded-full bg-saffron px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
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
            {allCombos.map((c) => (
              <article key={c.id} className="group">
                <Link
                  to="/product/$slug"
                  params={{ slug: c.slug }}
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
                </Link>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                      {c.series}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{c.name}</h3>
                    {(() => {
                      const s = ratingBySlug.get(c.slug);
                      return s && s.count > 0 ? (
                        <div
                          className="mt-1.5 flex items-center gap-1.5"
                          aria-label={`${s.average} out of 5 from ${s.count} reviews`}
                        >
                          <StarRating value={s.average} className="size-3.5" />
                          <span className="text-[11px] text-ivory/60">
                            {s.average.toFixed(1)} ({s.count})
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gold">{inr(c.priceNum)}</span>
                    {c.mrp && c.mrp > c.priceNum && (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-xs text-ivory/50 line-through">{inr(c.mrp)}</span>
                        <span className="text-[10px] font-semibold text-saffron">
                          {Math.round((1 - c.priceNum / c.mrp) * 100)}% off
                        </span>
                      </span>
                    )}
                  </div>
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

      {/* Hamper — Coming Soon */}
      <section className="border-y border-border bg-ivory px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon via-ink to-ink px-8 py-14 text-center text-ivory md:px-16 md:py-20">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, oklch(0.82 0.13 85) 0%, transparent 60%), radial-gradient(circle at 80% 50%, oklch(0.72 0.18 55) 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Coming Soon
              </span>
              <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
                Festive Hampers
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-ivory/60 md:text-lg">
                Curated gift hampers with rakhis, diyas and festive surprises — all packed in a beautiful box. Launching soon for Raksha Bandhan 2026.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-semibold uppercase tracking-widest text-ivory/50">
                <span>✦ Premium Packaging</span>
                <span>✦ Thank You Card</span>
                <span>✦ Same-Day Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-ink px-4 py-14 text-ivory md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-script text-lg text-gold">हमारे बारे में</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Made with love.<br />
              <span className="italic text-saffron">Delivered with care.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ivory/70">
              Utsavify is a celebration brand born from the belief that every festival deserves something made with heart. We personally curate every rakhi in our collection — choosing pieces that carry warmth, beauty and the spirit of the occasion.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ivory/70">
              From the hands that craft them to the doors we deliver to — every step is done with the same care we'd put into a gift for our own family. This Raksha Bandhan, we're honoured to be part of your celebration.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-widest text-ivory/40">
              <span>✦ Handpicked Collection</span>
              <span>✦ Made in India</span>
              <span>✦ Family-Run</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "2026", l: "Collection" },
              { n: "100%", l: "Handpicked" },
              { n: "Pan-India", l: "Delivery" },
              { n: "5★", l: "Customer Love" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-ivory/10 bg-ivory/5 p-6 text-center">
                <p className="font-display text-3xl font-extrabold text-saffron">{s.n}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ivory/50">{s.l}</p>
              </div>
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
              <a href="tel:+919024267783" className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-saffron text-ivory font-display text-lg">☎</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Call / WhatsApp</span>
                  <span className="block font-display text-lg font-semibold text-ink group-hover:text-saffron">+91 90242 67783</span>
                </span>
              </a>
              <a href="mailto:hello@utsavify.com" className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-maroon text-ivory font-display text-lg">✉</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
                  <span className="block font-display text-lg font-semibold text-ink group-hover:text-maroon">hello@utsavify.com</span>
                </span>
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
            <h3 className="font-display text-2xl font-semibold text-ink">Send us a message</h3>
            <p className="mt-1 text-sm text-muted-foreground">Or drop a quick note — we'll get back over email.</p>
            <form
              onSubmit={handleContact}
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
              Order by Aug 20 for <br className="hidden md:block" />
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
            { t: "Free Delivery", s: "No delivery charges, ever" },
            { t: "Up to 10% Off", s: "5% prepaid · Extra 5% on ₹1000+" },
            { t: "COD Available", s: "On orders below ₹500" },
            { t: "3-Day Returns", s: "Damaged items with proof" },
          ].map((f) => (
            <div key={f.t} className="bg-ivory px-6 py-8 text-center">
              <p className="font-display text-base font-semibold text-ink">{f.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Return Policy */}
      <section className="border-b border-border bg-ivory px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <GoldRule />
            <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Return Policy</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">We want you to love every purchase. Here's how our return policy works.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-saffron/10 text-2xl">🎀</span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">Rakhis</p>
                  <span className="mt-0.5 inline-block rounded-full bg-destructive/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-destructive">Non-Returnable</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">Rakhis are non-returnable due to their festive nature — <strong className="text-ink">unless received damaged</strong>. In that case, we're happy to help.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-saffron/10 text-2xl">📦</span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">Other Products</p>
                  <span className="mt-0.5 inline-block rounded-full bg-saffron/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-saffron">3-Day Returns</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">Returns accepted within <strong className="text-ink">3 days of delivery</strong> for <strong className="text-ink">damaged items only</strong>. A photo or video of the unboxing is required as proof.</p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            To initiate a return, contact us at{" "}
            <a href="mailto:hello@utsavify.com" className="text-saffron hover:underline">hello@utsavify.com</a>
            {" "}or WhatsApp{" "}
            <a href="https://wa.me/919024267783" className="text-saffron hover:underline">+91 90242 67783</a>
            {" "}within 3 days of delivery.
          </p>
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
            <img src={logoImg} alt="Utsavify" className="h-16 w-auto" />
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
              <li><a href="/rakhi-for-brother" className="hover:text-saffron">Rakhi for Brother</a></li>
              <li><a href="/rakhi-combo-family-pack" className="hover:text-saffron">Combo Packs</a></li>
              <li><a href="/raksha-bandhan-2026-gift-guide" className="hover:text-saffron">Gift Guide 2026</a></li>
              <li><button onClick={() => scrollTo("about")} className="hover:text-saffron">About Us</button></li>
              <li><button onClick={() => scrollTo("contact")} className="hover:text-saffron">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Help
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="mailto:hello@utsavify.com" className="hover:text-saffron">hello@utsavify.com</a></li>
              <li><a href="tel:+919024267783" className="hover:text-saffron">+91 90242 67783</a></li>
              <li><a href="/return-policy" className="hover:text-saffron">Return & Shipping Policy</a></li>
              <li><a href="/privacy-policy" className="hover:text-saffron">Privacy Policy</a></li>
              <li><a href="/terms-conditions" className="hover:text-saffron">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-gold">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><a href="https://instagram.com/utsavify2026" target="_blank" rel="noopener noreferrer" className="hover:text-saffron">Instagram · @utsavify2026</a></li>
              <li><a href="https://wa.me/919024267783" className="hover:text-saffron">WhatsApp · +91 90242 67783</a></li>
              <li>Facebook · /utsavify</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-ivory/40 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p>© 2026 Utsavify. All rights reserved.</p>
            <p>Utsavify is operated by JHL Enterprises · GSTIN 08DIIPG6918L1ZR</p>
            <p>A-27, First Floor, A Block, Apana Ghar Shalimar Extension, Near Bhakti Dham Mandir, Alwar, Rajasthan 301001</p>
          </div>
          <p className="font-script text-base text-gold">शुभकामनाएँ ✦ Made in India</p>
        </div>
      </footer>

      {/* Checkout / Address Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!open) { setCheckoutOpen(false); setOrderSuccess(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-ivory sm:max-w-2xl">
          {orderSuccess ? (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-saffron/15 text-5xl">
                🎉
              </div>
              <div>
                <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                  Thank you, {orderSuccess.name.split(" ")[0]}!
                </DialogTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your order has been successfully placed.
                </p>
              </div>
              <div className="w-full rounded-2xl border border-saffron/30 bg-saffron/5 px-6 py-5 text-left text-sm text-ink">
                <p className="font-semibold text-maroon">Order Confirmed ✓</p>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  We've received your order and our team will coordinate with you shortly on WhatsApp or the mobile number you provided. Shipping to <span className="font-medium text-ink">{orderSuccess.city}</span> · <span className="font-medium text-ink">{inr(orderSuccess.total)}</span>.
                </p>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  For any queries, feel free to reach us via the contact section below. We usually reply within a few hours.
                </p>
              </div>
              <button
                onClick={() => { setCheckoutOpen(false); setOrderSuccess(null); }}
                className="rounded-full bg-maroon px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
          <>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold text-ink">
              {checkoutStep === 1 ? "Contact Details" : "Delivery & Payment"}
            </DialogTitle>
            <DialogDescription>
              {checkoutStep === 1
                ? "Step 1 of 2 — how do we reach you about your order?"
                : "Step 2 of 2 — where should your festive picks go?"}
            </DialogDescription>
          </DialogHeader>
          {checkoutStep === 1 ? (
          <form onSubmit={handleContactContinue} className="mt-4 space-y-4">
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
              <Label htmlFor="email">Email * (for order updates)</Label>
              <Input
                id="email"
                type="email"
                required
                value={address.email}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We only use these for order updates and delivery coordination — no spam.
            </p>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order Total</p>
                <p className="font-display text-2xl font-extrabold text-maroon">{inr(cartTotal)}</p>
              </div>
              <button
                type="submit"
                className="rounded-full bg-saffron px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
              >
                Continue →
              </button>
            </div>
          </form>
          ) : (
          <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setCheckoutStep(1)}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-saffron"
            >
              ← {address.fullName.split(" ")[0]} · {address.phone} — Edit
            </button>
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
                  { v: "cod", label: "Cash on Delivery", note: codAvailable ? "Available" : "Orders below ₹500 only" },
                  { v: "razorpay", label: "Pay Online", note: "UPI · Cards · Wallets — Save up to 10%" },
                ].map((opt) => {
                  const disabled = opt.v === "cod" && !codAvailable;
                  return (
                    <label
                      key={opt.v}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                        disabled
                          ? "cursor-not-allowed border-border opacity-40"
                          : address.payment === opt.v
                          ? "cursor-pointer border-saffron bg-saffron/10"
                          : "cursor-pointer border-border hover:border-saffron"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.v}
                        checked={address.payment === opt.v}
                        disabled={disabled}
                        onChange={(e) => !disabled && setAddress({ ...address, payment: e.target.value })}
                        className="accent-saffron"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">{opt.label}</span>
                        <span className={`text-[11px] ${opt.v === "upi" ? "text-saffron" : "text-muted-foreground"}`}>{opt.note}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            {address.payment === "razorpay" && (
              <div className="flex items-center gap-3 rounded-lg border border-saffron/40 bg-saffron/5 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-saffron/20 text-xl">
                  🔒
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Secure Payment via Razorpay</p>
                  <p className="text-xs text-muted-foreground">
                    UPI · Debit/Credit Cards · Net Banking · Wallets
                  </p>
                </div>
              </div>
            )}
            <div className="border-t border-border pt-4">
              {bulkDiscount > 0 && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-saffron/10 px-4 py-2 text-sm">
                  <span className="text-saffron font-semibold">5% Bulk Discount (₹1000+)</span>
                  <span className="font-semibold text-saffron">−{inr(bulkDiscount)}</span>
                </div>
              )}
              {prepaidDiscount > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-lg bg-saffron/10 px-4 py-2 text-sm">
                  <span className="text-saffron font-semibold">5% Prepaid Discount</span>
                  <span className="font-semibold text-saffron">−{inr(prepaidDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {(prepaidDiscount > 0 || bulkDiscount > 0) ? "You Pay" : "Order Total"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-2xl font-extrabold text-maroon">{inr(payableTotal)}</p>
                    {(prepaidDiscount > 0 || bulkDiscount > 0) && (
                      <p className="text-sm line-through text-muted-foreground">{inr(cartTotal)}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-saffron px-8 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon disabled:opacity-60"
                >
                  {submitting
                    ? address.payment === "razorpay" ? "Opening Payment..." : "Submitting..."
                    : address.payment === "razorpay" ? "Proceed to Pay" : "Place Order"}
                </button>
              </div>
            </div>
          </form>
          )}
          </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
