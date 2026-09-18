import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CenterFilters, fetchCenter, fetchCenters, updateMyCenter, UpdateCenterPayload } from "../services/centers.api";

export function useCenters(filters: CenterFilters) {
  return useQuery({
    queryKey: ["centers", filters],
    queryFn: () => fetchCenters(filters),
  });
}

export function useCenter(id: string | undefined) {
  return useQuery({
    queryKey: ["center", id],
    queryFn: () => fetchCenter(id as string),
    enabled: !!id,
  });
}

export function useUpdateMyCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCenterPayload) => updateMyCenter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centers"] });
    },
  });
}
