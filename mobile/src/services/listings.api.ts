import { api } from "./api";
import { Listing, ListingStatus, PriceType } from "../types";

export type ListingFilters = {
  materialType?: string;
  status?: ListingStatus;
  ownerId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  maxPrice?: number;
  search?: string;
};

export async function fetchListings(filters: ListingFilters = {}) {
  const { data } = await api.get<{ listings: Listing[] }>("/listings", { params: filters });
  return data.listings;
}

export async function fetchListing(id: string) {
  const { data } = await api.get<{ listing: Listing }>(`/listings/${id}`);
  return data.listing;
}

export type NewListingPayload = {
  materialType: string;
  title: string;
  description?: string;
  quantityKg: number;
  priceType: PriceType;
  pricePerKg?: number;
  addressText?: string;
  lat?: number;
  lng?: number;
  photos?: { uri: string; name: string; type: string }[];
};

export async function createListing(payload: NewListingPayload) {
  const form = new FormData();
  form.append("materialType", payload.materialType);
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  form.append("quantityKg", String(payload.quantityKg));
  form.append("priceType", payload.priceType);
  if (payload.pricePerKg !== undefined) form.append("pricePerKg", String(payload.pricePerKg));
  if (payload.addressText) form.append("addressText", payload.addressText);
  if (payload.lat !== undefined) form.append("lat", String(payload.lat));
  if (payload.lng !== undefined) form.append("lng", String(payload.lng));
  payload.photos?.forEach((photo) => {
    // @ts-expect-error - RN FormData aceita esse formato de arquivo
    form.append("photos", { uri: photo.uri, name: photo.name, type: photo.type });
  });

  const { data } = await api.post<{ listing: Listing }>("/listings", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.listing;
}

export async function updateListingStatus(id: string, status: ListingStatus) {
  const { data } = await api.patch<{ listing: Listing }>(`/listings/${id}`, { status });
  return data.listing;
}

export async function deleteListing(id: string) {
  await api.delete(`/listings/${id}`);
}
