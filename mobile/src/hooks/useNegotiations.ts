import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNegotiation,
  fetchNegotiations,
  sendMessage,
  sendOffer,
  startNegotiation,
} from "../services/negotiations.api";
import { OfferType } from "../types";
import { getSocket } from "../services/socket";

export function useNegotiations() {
  return useQuery({
    queryKey: ["negotiations"],
    queryFn: fetchNegotiations,
    refetchInterval: 20000,
  });
}

export function useNegotiation(id: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("negotiation:join", id);
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["negotiation", id] });
    socket.on("message:new", invalidate);
    socket.on("negotiation:update", invalidate);

    return () => {
      socket.emit("negotiation:leave", id);
      socket.off("message:new", invalidate);
      socket.off("negotiation:update", invalidate);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["negotiation", id],
    queryFn: () => fetchNegotiation(id as string),
    enabled: !!id,
  });
}

export function useStartNegotiation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      pricePerKg,
      quantityKg,
      message,
    }: {
      listingId: string;
      pricePerKg?: number;
      quantityKg: number;
      message?: string;
    }) => startNegotiation(listingId, { pricePerKg, quantityKg, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiations"] });
    },
  });
}

export function useSendOffer(negotiationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: OfferType; pricePerKg?: number; quantityKg?: number; message?: string }) =>
      sendOffer(negotiationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiation", negotiationId] });
      queryClient.invalidateQueries({ queryKey: ["negotiations"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useSendMessage(negotiationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendMessage(negotiationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiation", negotiationId] });
    },
  });
}
