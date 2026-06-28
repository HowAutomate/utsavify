import type { CartItem } from "@/contexts/cart";

/**
 * Box-bundle pricing.
 *
 * Packing (₹20) + logistics (₹90) = ₹110 is per-box, not per-rakhi. A single
 * box holds up to 3 rakhis and pays that shipping once. So only the FIRST
 * (most expensive) rakhi in each box pays its full listed price — every extra
 * rakhi in the same box is charged just its product cost + ₹20 margin:
 *
 *   - regular rakhi add-on:        ₹50
 *   - Bhaiya-Bhabhi rakhi add-on:  ₹100
 *
 * Rules:
 *   - Up to 3 rakhis per box; the 4th opens a new box (pays full shipping again
 *     via a fresh full-price base item).
 *   - The most expensive rakhi in each box pays full price (margin-safe — we
 *     never sell a premium rakhi at the add-on rate).
 *   - Bundle SKUs (combos, hampers, gift packs) are already discounted, fixed-
 *     price sets: they keep their price and never take part in the box math —
 *     they're neither a box base nor a cheap add-on. Any product whose Category
 *     contains "combo", "hamper" or "bundle" is treated as a bundle, so a future
 *     "Hamper"/"Gift Hamper"/"Rakhi Bundle" category is auto-excluded too.
 */

const REGULAR_ADD_ON = 50;
const BHAIYA_BHABHI_ADD_ON = 100;
const BOX_CAPACITY = 3;

export const BHAIYA_BHABHI_CATEGORY = "Bhaiya Bhabhi";
/** Category keywords that mark a product as a pre-bundled set, excluded from box pricing. */
const BUNDLE_CATEGORY_KEYWORDS = ["combo", "hamper", "bundle"];

/** True for combos/hampers/gift packs — pre-bundled SKUs that bypass box pricing entirely. */
export function isBundle(item: { category: string }): boolean {
  const c = (item.category ?? "").toLowerCase();
  return BUNDLE_CATEGORY_KEYWORDS.some((k) => c.includes(k));
}

/** Per-unit add-on rate for a rakhi that rides along in an existing box. */
export function addOnRate(category: string): number {
  return category === BHAIYA_BHABHI_CATEGORY ? BHAIYA_BHABHI_ADD_ON : REGULAR_ADD_ON;
}

export type BoxPricing = {
  /** What the customer actually pays (box-aware), before prepaid/bulk discounts. */
  cartTotal: number;
  /** Naive sum of priceNum × qty — used for the strike-through "you saved" line. */
  naiveTotal: number;
  /** naiveTotal − cartTotal. */
  savings: number;
  /** Number of rakhi units (combos excluded) sharing boxes. */
  rakhiUnits: number;
  /** Number of boxes those rakhis pack into (ceil(rakhiUnits / 3)). */
  boxCount: number;
  /** Free add-on slots left in the current (last) box — drives the upsell nudge. */
  slotsLeftInBox: number;
};

export function computeBoxPricing(cart: CartItem[]): BoxPricing {
  let bundleTotal = 0;
  // Expand every single rakhi (non-bundle) into individual units.
  const units: { price: number; addOn: number }[] = [];

  for (const item of cart) {
    if (isBundle(item)) {
      bundleTotal += item.priceNum * item.qty;
      continue;
    }
    const rate = Math.min(addOnRate(item.category), item.priceNum);
    for (let i = 0; i < item.qty; i++) {
      units.push({ price: item.priceNum, addOn: rate });
    }
  }

  // Most expensive first → the top `boxCount` units are the per-box base
  // (full price); everything after pays its add-on rate.
  units.sort((a, b) => b.price - a.price);
  const boxCount = Math.ceil(units.length / BOX_CAPACITY);

  let rakhiTotal = 0;
  units.forEach((u, idx) => {
    rakhiTotal += idx < boxCount ? u.price : u.addOn;
  });

  const cartTotal = bundleTotal + rakhiTotal;
  const naiveTotal = cart.reduce((s, i) => s + i.priceNum * i.qty, 0);

  // Slots left before the current box is full (and a new box's shipping kicks in).
  const inLastBox = units.length === 0 ? 0 : ((units.length - 1) % BOX_CAPACITY) + 1;
  const slotsLeftInBox = units.length === 0 ? 0 : BOX_CAPACITY - inLastBox;

  return {
    cartTotal,
    naiveTotal,
    savings: naiveTotal - cartTotal,
    rakhiUnits: units.length,
    boxCount,
    slotsLeftInBox,
  };
}
