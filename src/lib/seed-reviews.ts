import { summarise, type Review, type ReviewSummary } from "./sheet-reviews";

/**
 * Baseline (seed) reviews so every product shows social proof from day one,
 * before real customer reviews come in via the Sheet. These are generated
 * deterministically from the product slug, so a given product always shows the
 * same seed reviews / rating. Real approved reviews are merged on top and
 * naturally outweigh these as they accumulate.
 *
 * Flip SEED_ENABLED to false to show ONLY genuine Sheet reviews.
 */
export const SEED_ENABLED = true;

// Stable 31-bit hash of a string → non-negative int.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const NAMES = [
  "Priya S.", "Rahul M.", "Anjali K.", "Vikram R.", "Sneha P.", "Amit T.",
  "Pooja G.", "Karan V.", "Neha D.", "Rohit B.", "Meera J.", "Sanjay H.",
  "Divya N.", "Arjun S.", "Kavya R.", "Manish A.", "Ritu K.", "Deepak C.",
  "Shreya M.", "Nikhil P.", "Aarti V.", "Gaurav S.", "Tanya G.", "Suresh L.",
  "Isha B.", "Varun T.", "Komal R.", "Harsh D.", "Swati M.", "Akshay P.",
];

// Generic, gifting-appropriate review bodies keyed loosely by rating tier.
const TEXT_5 = [
  "Beautiful rakhi — looked exactly like the photos. My brother loved it!",
  "Lovely design and feels premium in hand. Highly recommend.",
  "Arrived well before Raksha Bandhan and the packaging was gift-ready.",
  "Great quality for the price. Bright colours and neat finishing.",
  "Ordered for my bhaiya and he was so happy. Will order again!",
  "Exactly as described. Delivery was quick and the box was lovely.",
  "Gorgeous piece, even better in person. Very happy with Utsavify.",
  "Perfect gift, beautifully packed. Smooth experience start to finish.",
];
const TEXT_4 = [
  "Nice rakhi, good quality. Slightly smaller than I expected but lovely.",
  "Good product and gift-ready packaging. Delivery took a couple of days.",
  "Pretty design and well made. Happy overall.",
  "Looks nice and feels sturdy. Worth the price.",
];
const TEXT_3 = [
  "Decent rakhi for the price. Design is nice though finishing could be better.",
  "It's okay — looks good but delivery was a little slow.",
];

const TITLES = [
  "Loved it!", "Beautiful", "Highly recommend", "Great quality",
  "Brother loved it", "Gift-ready", "Worth it", "Lovely design",
  "", "", "", // some reviews have no title
];

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

// Build a deterministic rating array averaging ~4.6 (occasionally a 3).
function ratingsFor(seed: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = (seed + i * 17) % 10;
    if (r === 0 && i === count - 1) out.push(3); // rare low note
    else if (r < 3) out.push(4);
    else out.push(5);
  }
  return out;
}

/** Deterministic seed reviews for a product slug (3–5 reviews). */
export function seedReviewsFor(slug: string): Review[] {
  if (!SEED_ENABLED || !slug) return [];
  const h = hash(slug);
  const count = 3 + (h % 3); // 3, 4, or 5
  const ratings = ratingsFor(h, count);

  return ratings.map((rating, i) => {
    const n = h + i * 7;
    const tier = rating === 5 ? TEXT_5 : rating === 4 ? TEXT_4 : TEXT_3;
    const daysAgo = 4 + ((h + i * 11) % 40); // 4–43 days ago
    return {
      id: `seed-${slug}-${i}`,
      slug,
      name: pick(NAMES, n),
      rating,
      title: pick(TITLES, n + 3) || undefined,
      text: pick(tier, n),
      date: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    };
  });
}

/**
 * Merge real (Sheet) reviews for a slug with seed reviews — real first
 * (newest-feeling), seeds after. Single source for cards, inline summary,
 * and the reviews list so the numbers always match.
 */
export function reviewsForSlug(slug: string, sheetReviews: Review[]): Review[] {
  const real = sheetReviews.filter((r) => r.slug === slug);
  return [...real, ...seedReviewsFor(slug)];
}

/** Aggregate summary (avg/count/distribution) for a slug, seeds included. */
export function summaryForSlug(slug: string, sheetReviews: Review[]): ReviewSummary {
  return summarise(reviewsForSlug(slug, sheetReviews));
}
