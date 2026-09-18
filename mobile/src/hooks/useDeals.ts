import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, fetchDeal, fetchDeals, fetchUserReviews, updateDealStatus } from "../services/deals.api";
import { DealStatus } from "../types";

export function useDeals() {
  return useQuery({ queryKey: ["deals"], queryFn: fetchDeals, refetchInterval: 20000 });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ["deal", id],
    queryFn: () => fetchDeal(id as string),
    enabled: !!id,
  });
}

export function useUpdateDealStatus(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, scheduledAt }: { status: DealStatus; scheduledAt?: string }) =>
      updateDealStatus(dealId, status, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useCreateReview(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) => createReview(dealId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    },
  });
}

export function useUserReviews(userId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => fetchUserReviews(userId as string),
    enabled: !!userId,
  });
}
