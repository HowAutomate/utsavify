import type { CartItem } from "@/contexts/cart";

/**
 * Box-bundle pricing.
 *
 * Packing (₹20) + logistics (₹90) = ₹110 is per-box, not per-rakhi. A single
 * box holds up to 3 rakhis and pays that shipping once. So only the FIRST
 * (most expensive) rakhi in each box pays its full listed price — every extra
 * rakhi in the same box is charged just its product cost + ₹20 margin:
 *
 *   - regular rakhi add-on:        ₹45  (avg cost ₹25 + ₹20 margin)
 *   - Bhaiya-Bhabhi rakhi add-on:  ₹70  (avg cost ₹50 + ₹20 margin)
 *
 * Rules:
 *   - Up to 3 rakhis per box; the 4th opens a new box (pays full shipping again
 *     via a fresh full-price base item).
 *   - The most expensive rakhi in each box pays full price (margin-safe — we
 *     never sell a premium rakhi at the add-on rate).
 *   - Combo SKUs are already discounted bundles: they keep their fixed price
 *     and don't take part in the box math.
 */

const REGULAR_ADD_ON = 45;
const BHAIYA_BHABHI_ADD_ON = 70;
const BOX_CAPACITY = 3;

export const COMBO_CATEGORY = "Combo";
export const BHAIYA_BHABHI_CATEGORY = "Bhaiya Bhabhi";

export function isCombo(item: { category: string }): boolean {
  return item.category === COMBO_CATEGORY;
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
  let comboTotal = 0;
  // Expand every non-combo rakhi into individual units.
  const units: { price: number; addOn: number }[] = [];

  for (const item of cart) {
    if (isCombo(item)) {
      comboTotal += item.priceNum * item.qty;
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

  const cartTotal = comboTotal + rakhiTotal;
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
