import { useQuery } from "@tanstack/react-query";
import { fetchSheetReviews } from "@/lib/sheet-reviews";

export function useSheetReviews() {
  return useQuery({
    queryKey: ["sheet-reviews"],
    queryFn: fetchSheetReviews,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });
}
