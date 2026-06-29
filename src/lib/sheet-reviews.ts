export type Review = {
  id: string;
  slug: string;
  name: string;
  rating: number; // 1–5
  title?: string;
  text: string;
  date?: string; // ISO string when available
};

// Reviews live in a "Reviews" tab of the SAME spreadsheet that drives the
// catalog (see lib/sheet-products.ts). We read it the same way — gviz JSON —
// and only surface rows whose Approved column is "Yes" (manual moderation).
const REVIEWS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1QVrU-7__FXqQ_Nx86APpx5bCkXaKiCuB4buPY4vRq0s/gviz/tq?tqx=out:json&sheet=Reviews&headers=1";

interface GvizCol { label: string }
interface GvizCell { v: unknown; f?: string }
interface GvizRow { c: (GvizCell | null)[] }

function str(v: unknown): string {
  return v != null ? String(v).trim() : "";
}

// Clamp a raw cell into a 1–5 integer rating (0/undefined → dropped by caller).
function rating(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, n));
}

// gviz serialises date cells as `Date(2026,5,29,...)` (month is 0-indexed).
// Anything else we pass through as plain text.
function dateStr(cell: GvizCell | null): string | undefined {
  if (!cell) return undefined;
  const raw = str(cell.v);
  const m = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(raw);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(
      Number(y), Number(mo), Number(d),
      Number(h ?? 0), Number(mi ?? 0), Number(s ?? 0),
    ).toISOString();
  }
  return raw || cell.f || undefined;
}

export async function fetchSheetReviews(): Promise<Review[]> {
  const res = await fetch(REVIEWS_SHEET_URL);
  if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);
  const raw = await res.text();
  // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const json = raw.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(json);

  const cols: string[] = data.table.cols.map((c: GvizCol) => c.label);
  const colIndex = (label: string) => cols.indexOf(label);

  const reviews: Review[] = [];
  let i = 0;

  for (const row of data.table.rows as GvizRow[]) {
    if (!row?.c) continue;

    const cell = (label: string): GvizCell | null => {
      const idx = colIndex(label);
      return idx >= 0 ? (row.c[idx] ?? null) : null;
    };
    const val = (label: string): unknown => cell(label)?.v ?? null;

    const slug = str(val("Slug"));
    const name = str(val("Name"));
    const text = str(val("Review"));
    const stars = rating(val("Rating"));
    const approved = str(val("Approved"));

    // Only approved rows with the essentials make it to the site.
    if (!slug || !name || !text || !stars || approved !== "Yes") continue;

    reviews.push({
      id: `r-${slug}-${i++}`,
      slug,
      name,
      rating: stars,
      title: str(val("Title")) || undefined,
      text,
      date: dateStr(cell("Date")),
    });
  }

  return reviews;
}

// ---- Aggregation helpers --------------------------------------------------

export type ReviewSummary = {
  count: number;
  average: number; // rounded to 1 decimal
  /** counts[5]..counts[1] — number of reviews at each star level */
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function summarise(reviews: Review[]): ReviewSummary {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["counts"];
  for (const r of reviews) counts[r.rating as 1 | 2 | 3 | 4 | 5]++;
  const count = reviews.length;
  const total = reviews.reduce((s, r) => s + r.rating, 0);
  const average = count ? Math.round((total / count) * 10) / 10 : 0;
  return { count, average, counts };
}
