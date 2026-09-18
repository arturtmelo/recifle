import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createListing,
  fetchListing,
  fetchListings,
  ListingFilters,
  NewListingPayload,
  updateListingStatus,
} from "../services/listings.api";
import { ListingStatus } from "../types";

export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id as string),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewListingPayload) => createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) => updateListingStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", variables.id] });
    },
  });
}
