import type { Product } from "./products";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&headers=1";

interface GvizCol { label: string }
interface GvizCell { v: unknown }
interface GvizRow { c: (GvizCell | null)[] }

function str(v: unknown): string {
  return v != null ? String(v).trim() : "";
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export async function fetchSheetProducts(): Promise<Product[]> {
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const raw = await res.text();
  // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const json = raw.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(json);

  const cols: string[] = data.table.cols.map((c: GvizCol) => c.label);

  const get = (row: GvizRow, col: string): unknown => {
    const i = cols.indexOf(col);
    return i >= 0 ? (row.c[i]?.v ?? null) : null;
  };

  const products: Product[] = [];

  for (const row of data.table.rows as GvizRow[]) {
    if (!row?.c) continue;

    const slug = str(get(row, "Slug"));
    const name = str(get(row, "Name"));
    const price = num(get(row, "Price"));
    const status = str(get(row, "Status"));
    const inStock = str(get(row, "InStock"));

    // Skip rows that are incomplete or not active
    if (!slug || !name || !price || status !== "Active" || inStock !== "Yes") continue;

    const rawImages = ["Image1", "Image2", "Image3", "Image4"]
      .map((col) => str(get(row, col)))
      .filter(Boolean);

    products.push({
      id: `s-${slug}`,
      slug,
      name,
      series: str(get(row, "Series")),
      category: str(get(row, "Category")) || "Designer",
      priceNum: price,
      cost: num(get(row, "Cost")),
      mrp: num(get(row, "MRP")),
      img: rawImages[0] ?? "",
      images: rawImages.length > 1 ? rawImages : undefined,
      badge: str(get(row, "Badge")) || null,
      description: str(get(row, "Description")) || undefined,
      materials: str(get(row, "Materials")) || undefined,
      craftType: str(get(row, "CraftType")) || undefined,
      suitableFor: str(get(row, "SuitableFor")) || undefined,
      dimensions: str(get(row, "Dimensions")) || undefined,
      packageContent: str(get(row, "PackageContent")) || undefined,
      pieces: num(get(row, "Pieces")),
      deliveryDays: num(get(row, "DeliveryDays")),
    });
  }

  return products;
}
