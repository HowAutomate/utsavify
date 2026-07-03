/**
 * Analytics: Meta Pixel + Google Analytics 4 (gtag.js).
 *
 * Both are driven by env vars and are completely OPTIONAL — if an ID is not
 * set (e.g. in local dev), that platform silently no-ops, so nothing breaks.
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   VITE_META_PIXEL_ID   e.g. 1234567890123456   (Meta Events Manager → Data Sources)
 *   VITE_GA4_ID          e.g. G-XXXXXXXXXX        (GA4 Admin → Data Streams → Web)
 *
 * Because this is a client-rendered SPA, page views are fired manually on
 * every route change (see __root.tsx) instead of relying on the base snippet.
 */

const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim();
const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim();
const CURRENCY = "INR";

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialized = false;

function loadGa4(id: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // We fire page_view manually on SPA route changes, so disable the automatic one.
  window.gtag("config", id, { send_page_view: false });
}

function loadMetaPixel(id: string) {
  if (window.fbq) return;

  const queue: unknown[][] = [];
  const fbq: FbqFn = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else queue.push(args);
  }) as FbqFn;
  fbq.queue = queue;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = window._fbq || fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", id);
}

/** Load the tracking libraries once. Safe to call multiple times. */
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  if (GA4_ID) loadGa4(GA4_ID);
  if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID);
}

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  if (GA4_ID) {
    window.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (META_PIXEL_ID) window.fbq?.("track", "PageView");
}

type TrackItem = {
  id: string;
  name: string;
  category?: string;
  priceNum: number;
  qty?: number;
};

function ga4Item(p: TrackItem, quantity: number) {
  return {
    item_id: p.id,
    item_name: p.name,
    item_category: p.category,
    price: p.priceNum,
    quantity,
  };
}

export function trackViewContent(p: TrackItem) {
  if (GA4_ID) {
    window.gtag?.("event", "view_item", {
      currency: CURRENCY,
      value: p.priceNum,
      items: [ga4Item(p, 1)],
    });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "ViewContent", {
      content_ids: [p.id],
      content_name: p.name,
      content_type: "product",
      value: p.priceNum,
      currency: CURRENCY,
    });
  }
}

export function trackAddToCart(p: TrackItem) {
  const quantity = p.qty ?? 1;
  const value = p.priceNum * quantity;
  if (GA4_ID) {
    window.gtag?.("event", "add_to_cart", {
      currency: CURRENCY,
      value,
      items: [ga4Item(p, quantity)],
    });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "AddToCart", {
      content_ids: [p.id],
      content_name: p.name,
      content_type: "product",
      value,
      currency: CURRENCY,
    });
  }
}

export function trackInitiateCheckout(value: number, numItems: number) {
  if (GA4_ID) {
    window.gtag?.("event", "begin_checkout", { currency: CURRENCY, value });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "InitiateCheckout", {
      value,
      currency: CURRENCY,
      num_items: numItems,
    });
  }
}

export function trackPurchase(value: number, paymentMethod: "cod" | "razorpay") {
  if (GA4_ID) {
    window.gtag?.("event", "purchase", {
      currency: CURRENCY,
      value,
      transaction_id: `UTS-${Date.now()}`,
      payment_type: paymentMethod,
    });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "Purchase", { value, currency: CURRENCY });
  }
}
