import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart";
import { getProductBySlug, inr, allProducts, mergeBySlug } from "@/lib/products";
import { useSheetProducts } from "@/hooks/use-sheet-products";
import logoImg from "@/assets/utsavify-logo.png";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { data: sheetProducts = [], isLoading: sheetLoading } = useSheetProducts();
  const [activeTab, setActiveTab] = useState<"description" | "details" | "returns">("description");
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const product = useMemo(
    () => sheetProducts.find((p) => p.slug === slug) ?? getProductBySlug(slug),
    [slug, sheetProducts],
  );

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const imgs = (product.images ?? []).filter(Boolean);
    return imgs.length > 0 ? imgs : [product.img];
  }, [product]);

  const activeImg = gallery[activeIdx] ?? product?.img ?? "";

  const combined = useMemo(() => mergeBySlug(allProducts, sheetProducts), [sheetProducts]);

  const related = useMemo(
    () =>
      product
        ? combined.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
        : [],
    [product, combined],
  );

  useEffect(() => {
    if (product) document.title = `${product.name} — Utsavify`;
    else if (!sheetLoading) document.title = "Product not found — Utsavify";
    setActiveIdx(0);
  }, [product?.id, sheetLoading]);

  // Lightbox: lock body scroll + close on Escape
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowRight") setActiveIdx((i) => (i + 1) % gallery.length);
      if (e.key === "ArrowLeft") setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen, gallery.length]);

  if (!product && sheetLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-border border-t-saffron" />
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 font-sans text-ink">
        <h1 className="font-display text-4xl font-extrabold">Product not found</h1>
        <Link to="/" className="text-sm text-saffron hover:underline">← Back to shop</Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product);
    navigate({ to: "/", search: { cart: "open" } });
  };

  const discount = product.mrp
    ? Math.round((1 - product.priceNum / product.mrp) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background font-sans text-ink">
      {/* Promo Bar */}
      <div className="bg-maroon px-3 py-2 text-center text-[10px] font-semibold tracking-[0.15em] uppercase text-ivory sm:text-[11px] sm:tracking-[0.2em]">
        Free Delivery · 5% Off Prepaid · COD Below ₹500 · Order by Aug 20
      </div>

      {/* Mini Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/" aria-label="Utsavify home">
              <img src={logoImg} alt="Utsavify" className="h-12 w-auto md:h-16" />
            </Link>
            <Link
              to="/"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-saffron md:block"
            >
              ← All Rakhis
            </Link>
          </div>
          <Link
            to="/"
            search={{ cart: "open" }}
            className="rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-saffron md:px-5 md:py-2.5 md:text-xs"
          >
            Cart · {cartCount}
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-ivory">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-saffron">Home</Link>
            <span>›</span>
            <Link to="/" className="capitalize transition-colors hover:text-saffron">
              {product.category === "Combo" ? "Gift Sets" : product.category}
            </Link>
            <span>›</span>
            <span className="truncate text-ink">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">

          {/* Image gallery */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setZoomed(false);
                setZoomOpen(true);
              }}
              aria-label="Tap to zoom"
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-xl"
            >
              <img
                src={activeImg}
                alt={product.name}
                className="aspect-square w-full bg-ivory object-cover"
              />
              {product.badge && (
                <span className="absolute left-5 top-5 z-20 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ivory">
                  {product.badge}
                </span>
              )}
              {/* Zoom hint */}
              <span className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ivory opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
                Tap to zoom
              </span>
            </button>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 size-16 overflow-hidden rounded-lg border-2 transition-colors md:size-20 ${
                      activeIdx === i ? "border-saffron" : "border-border hover:border-saffron/60"
                    }`}
                  >
                    <img src={src} alt={`${product.name} view ${i + 1}`} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-saffron">
              {product.series}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink md:text-4xl">
              {product.name}
            </h1>

            {/* Price row */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="font-display text-3xl font-extrabold text-maroon">
                {inr(product.priceNum)}
              </p>
              {product.mrp && (
                <p className="text-lg text-muted-foreground line-through">{inr(product.mrp)}</p>
              )}
              {discount && (
                <span className="rounded-full bg-saffron/15 px-2.5 py-0.5 text-xs font-semibold text-saffron">
                  {discount}% off
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Incl. of all taxes · Free delivery pan-India</p>

            {/* Tabs */}
            <div className="mt-6 border-b border-border">
              <div className="flex gap-6">
                {(["description", "details", "returns"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-saffron text-saffron"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 min-h-[90px] text-sm leading-relaxed text-muted-foreground">
              {activeTab === "description" && (
                <p>{product.description ?? "Handpicked, festival-ready and delivered across India."}</p>
              )}
              {activeTab === "details" && (
                <ul className="space-y-2">
                  {product.materials && (
                    <li><span className="font-semibold text-ink">Materials:</span> {product.materials}</li>
                  )}
                  {product.craftType && (
                    <li><span className="font-semibold text-ink">Craft:</span> {product.craftType}</li>
                  )}
                  {product.suitableFor && (
                    <li><span className="font-semibold text-ink">Suitable for:</span> {product.suitableFor}</li>
                  )}
                  {product.packageContent && (
                    <li><span className="font-semibold text-ink">Package contains:</span> {product.packageContent}</li>
                  )}
                  {product.dimensions && (
                    <li><span className="font-semibold text-ink">Dimensions:</span> {product.dimensions}</li>
                  )}
                  {product.pieces && (
                    <li><span className="font-semibold text-ink">Pieces:</span> {product.pieces}</li>
                  )}
                  {product.deliveryDays && (
                    <li><span className="font-semibold text-ink">Delivery:</span> Within {product.deliveryDays} days</li>
                  )}
                </ul>
              )}
              {activeTab === "returns" && (
                <div className="space-y-2">
                  <p>
                    Returns accepted within <span className="font-semibold text-ink">3 days</span> of
                    delivery — damaged or defective items only.
                  </p>
                  <p>
                    Share clear photos of the damage via WhatsApp or email. Delivery charges are
                    non-refundable.
                  </p>
                </div>
              )}
            </div>

            {/* Policy badges */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: "🚚", label: "Free Delivery" },
                { icon: "↩", label: "3-Day Returns" },
                { icon: "✦", label: "Handpicked" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-ivory/60 px-2 py-3 text-center"
                >
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 rounded-full bg-saffron py-3.5 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-full border-2 border-ink py-3.5 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border bg-ivory px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
              You may also like
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p) => (
                <article key={p.id} className="group">
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="relative mb-3 block overflow-hidden rounded-xl bg-muted"
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
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
                  <h3 className="mt-1 font-display text-sm font-semibold text-ink">{p.name}</h3>
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
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-ink px-4 py-8 text-center text-ivory/60 md:px-6">
        <p className="font-display text-base font-semibold text-ivory/80">Utsavify</p>
        <p className="mt-2 text-xs">
          © 2026 Utsavify ·{" "}
          <a href="mailto:hello@utsavify.com" className="transition-colors hover:text-ivory">
            hello@utsavify.com
          </a>{" "}
          ·{" "}
          <a href="tel:+919024267783" className="transition-colors hover:text-ivory">
            +91 90242 67783
          </a>
        </p>
      </footer>

      {/* Zoom lightbox */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-ivory/15 text-ivory transition-colors hover:bg-ivory/25"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>

          {/* Prev / Next */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(false);
                  setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/15 text-ivory transition-colors hover:bg-ivory/25 md:left-6"
              >
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(false);
                  setActiveIdx((i) => (i + 1) % gallery.length);
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/15 text-ivory transition-colors hover:bg-ivory/25 md:right-6"
              >
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </>
          )}

          {/* Zoomable image */}
          <div
            className="flex max-h-[90vh] max-w-[92vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImg}
              alt={product.name}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                setOrigin(`${x}% ${y}%`);
                setZoomed((z) => !z);
              }}
              onMouseMove={(e) => {
                if (!zoomed) return;
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                setOrigin(`${x}% ${y}%`);
              }}
              style={{ transformOrigin: origin }}
              className={`max-h-[90vh] max-w-[92vw] rounded-lg object-contain transition-transform duration-200 ${
                zoomed ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
          </div>

          {/* Counter */}
          {gallery.length > 1 && (
            <span className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ivory/15 px-3 py-1 text-xs font-medium text-ivory">
              {activeIdx + 1} / {gallery.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
