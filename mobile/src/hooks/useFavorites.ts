import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FavoriteTargetType,
  fetchFavoriteCenters,
  fetchFavoriteIds,
  fetchFavoriteListings,
  toggleFavorite,
} from "../services/favorites.api";

export function useFavoriteIds() {
  return useQuery({ queryKey: ["favorites", "ids"], queryFn: fetchFavoriteIds, staleTime: 10000 });
}

export function useIsFavorited(targetType: FavoriteTargetType, targetId: string) {
  const { data } = useFavoriteIds();
  if (!data) return false;
  return targetType === "LISTING" ? data.listingIds.includes(targetId) : data.centerIds.includes(targetId);
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: FavoriteTargetType; targetId: string }) =>
      toggleFavorite(targetType, targetId),
    onMutate: async ({ targetType, targetId }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", "ids"] });
      const previous = queryClient.getQueryData<{ listingIds: string[]; centerIds: string[] }>(["favorites", "ids"]);
      if (previous) {
        const key = targetType === "LISTING" ? "listingIds" : "centerIds";
        const has = previous[key].includes(targetId);
        queryClient.setQueryData(["favorites", "ids"], {
          ...previous,
          [key]: has ? previous[key].filter((id) => id !== targetId) : [...previous[key], targetId],
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["favorites", "ids"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useFavoriteListings() {
  return useQuery({ queryKey: ["favorites", "listings"], queryFn: fetchFavoriteListings });
}

export function useFavoriteCenters() {
  return useQuery({ queryKey: ["favorites", "centers"], queryFn: fetchFavoriteCenters });
}
