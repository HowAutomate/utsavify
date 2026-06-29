import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StarRating } from "@/components/star-rating";
import { useSheetReviews } from "@/hooks/use-sheet-reviews";
import { summarise, type Review } from "@/lib/sheet-reviews";

// New reviews are POSTed here → n8n appends a row to the "Reviews" tab with
// Approved=No, then notifies. Same n8n host/pattern as orders & leads.
const REVIEWS_WEBHOOK_URL =
  "https://n8n.srv1198552.hstgr.cloud/webhook/utsavify-reviews";

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
  const { data: allReviews = [], isLoading } = useSheetReviews();
  const reviews = useMemo<Review[]>(
    () => allReviews.filter((r) => r.slug === slug),
    [allReviews, slug],
  );
  const summary = useMemo(() => summarise(reviews), [reviews]);
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="reviews" className="border-t border-border bg-background px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
            Ratings &amp; Reviews
          </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-full border-2 border-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-ivory"
          >
            {showForm ? "Close" : "Write a Review"}
          </button>
        </div>

        {/* Summary */}
        {!isLoading && summary.count > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
            <div className="text-center sm:text-left">
              <p className="font-display text-5xl font-extrabold text-ink">
                {summary.average.toFixed(1)}
              </p>
              <div className="mt-2 flex justify-center sm:justify-start">
                <StarRating value={summary.average} className="size-5" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {summary.count} review{summary.count > 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex flex-col gap-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const c = summary.counts[star];
                const pct = summary.count ? (c / summary.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-3 text-right font-medium text-ink">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory">
                      <div className="h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right tabular-nums">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Write-a-review form */}
        {showForm && (
          <ReviewForm
            slug={slug}
            productName={productName}
            onDone={() => setShowForm(false)}
          />
        )}

        {/* Review list */}
        <div className="mt-10">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-ivory/50 px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold text-ink">No reviews yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to review {productName}.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {reviews.map((r) => {
                const when = formatDate(r.date);
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-border bg-ivory/40 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StarRating value={r.rating} className="size-4" />
                      {when && <span className="text-[11px] text-muted-foreground">{when}</span>}
                    </div>
                    {r.title && (
                      <p className="mt-3 font-display text-base font-semibold text-ink">{r.title}</p>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-saffron">
                      — {r.name}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  slug,
  productName,
  onDone,
}: {
  slug: string;
  productName: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
    const text = (form.elements.namedItem("review") as HTMLTextAreaElement)?.value?.trim();

    if (!rating) {
      toast.error("Please pick a star rating");
      return;
    }
    if (!name || !text) {
      toast.error("Please add your name and a few words");
      return;
    }

    const fd = new FormData();
    fd.append("type", "review");
    fd.append("slug", slug);
    fd.append("product", productName);
    fd.append("name", name);
    fd.append("rating", String(rating));
    fd.append("title", title ?? "");
    fd.append("review", text);
    fd.append("submittedAt", new Date().toISOString());

    setSubmitting(true);
    try {
      const res = await fetch(REVIEWS_WEBHOOK_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
      toast.success("Thanks for your review!", {
        description: "It'll appear here once our team approves it.",
      });
      form.reset();
      setRating(0);
      onDone();
    } catch {
      toast.error("Couldn't submit review", {
        description: "Please try again or email hello@utsavify.com",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-border bg-ivory/50 p-6 md:p-8"
    >
      <p className="font-display text-lg font-semibold text-ink">Review {productName}</p>

      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your rating
        </label>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} label="Your rating" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rv-name" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your name
          </label>
          <input
            id="rv-name"
            name="name"
            type="text"
            required
            maxLength={60}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron"
            placeholder="e.g. Priya S."
          />
        </div>
        <div>
          <label htmlFor="rv-title" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Title <span className="font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <input
            id="rv-title"
            name="title"
            type="text"
            maxLength={80}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron"
            placeholder="Loved it!"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="rv-text" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your review
        </label>
        <textarea
          id="rv-text"
          name="review"
          required
          rows={4}
          maxLength={1000}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron"
          placeholder="Tell shoppers what you liked about this rakhi…"
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-saffron px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
        <p className="text-[11px] text-muted-foreground">Reviews are checked before publishing.</p>
      </div>
    </form>
  );
}
