export type Product = {
  id: string;
  slug: string;
  name: string;
  series: string;
  category: string;
  priceNum: number;
  /** Our per-unit cost (base + packing) from the catalog Sheet's Cost column.
   *  Drives box add-on pricing (add-on = cost × 5). Optional — falls back to a
   *  flat add-on rate when absent. */
  cost?: number;
  mrp?: number;
  img: string;
  images?: string[];
  badge?: string | null;
  description?: string;
  materials?: string;
  craftType?: string;
  suitableFor?: string;
  dimensions?: string;
  packageContent?: string;
  pieces?: number;
  deliveryDays?: number;
};

// Catalog is fully Google-Sheet driven. These arrays are intentionally empty —
// every product comes from the live sheet (see lib/sheet-products.ts).
export const featuredRakhis: Product[] = [];
export const comboSets: Product[] = [];
export const allProducts: Product[] = [...featuredRakhis, ...comboSets];

/**
 * Merge local (code) products with sheet products, de-duplicated by slug.
 * Local arrays are empty now, so this effectively returns the sheet products;
 * kept so callers don't need to change and a hardcoded fallback can be re-added later.
 */
export function mergeBySlug(local: Product[], sheet: Product[]): Product[] {
  const bySlug = new Map<string, Product>();
  for (const p of local) bySlug.set(p.slug, p);
  for (const p of sheet) bySlug.set(p.slug, p);
  return [...bySlug.values()];
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
