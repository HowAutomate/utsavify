import { useQuery } from "@tanstack/react-query";
import { fetchSheetProducts } from "@/lib/sheet-products";

export function useSheetProducts() {
  return useQuery({
    queryKey: ["sheet-products"],
    queryFn: fetchSheetProducts,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });
}
