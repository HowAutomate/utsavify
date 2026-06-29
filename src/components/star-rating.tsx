import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  /** Current rating, 0–5. Fractions render partial fill in read-only mode. */
  value: number;
  /** Provide to make the stars interactive (1–5 selection). */
  onChange?: (value: number) => void;
  /** Tailwind size class for each star, e.g. "size-5". */
  className?: string;
  /** Accessible label for the interactive group. */
  label?: string;
};

/**
 * Saffron star rating. Read-only by default (supports fractional fill for
 * averages); pass `onChange` to turn it into a 1–5 picker.
 */
export function StarRating({ value, onChange, className, label }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const shown = hover ?? value;

  if (interactive) {
    return (
      <div role="radiogroup" aria-label={label ?? "Rating"} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange!(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                star <= shown ? "fill-saffron text-saffron" : "fill-transparent text-border",
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  // Read-only: render 5 stars with the active one partially clipped to `value`.
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1))); // 0..1
        return (
          <span key={star} className="relative inline-flex">
            <Star className={cn("size-4 fill-transparent text-border", className)} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("size-4 fill-saffron text-saffron", className)} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
