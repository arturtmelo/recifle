import { api } from "./api";
import { Negotiation, OfferType } from "../types";

export async function startNegotiation(
  listingId: string,
  payload: { pricePerKg?: number; quantityKg: number; message?: string }
) {
  const { data } = await api.post<{ negotiation: Negotiation }>(
    `/listings/${listingId}/negotiations`,
    payload
  );
  return data.negotiation;
}

export async function fetchNegotiations() {
  const { data } = await api.get<{ negotiations: Negotiation[] }>("/negotiations");
  return data.negotiations;
}

export async function fetchNegotiation(id: string) {
  const { data } = await api.get<{ negotiation: Negotiation }>(`/negotiations/${id}`);
  return data.negotiation;
}

export async function sendOffer(
  negotiationId: string,
  payload: { type: OfferType; pricePerKg?: number; quantityKg?: number; message?: string }
) {
  const { data } = await api.post(`/negotiations/${negotiationId}/offers`, payload);
  return data.offer;
}

export async function sendMessage(negotiationId: string, text: string) {
  const { data } = await api.post(`/negotiations/${negotiationId}/messages`, { text });
  return data.message;
}
