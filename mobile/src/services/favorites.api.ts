import { api } from "./api";
import { Listing, User } from "../types";

export type FavoriteTargetType = "LISTING" | "CENTRO";

export async function toggleFavorite(targetType: FavoriteTargetType, targetId: string) {
  const { data } = await api.post<{ favorited: boolean }>("/favorites/toggle", { targetType, targetId });
  return data.favorited;
}

export async function fetchFavoriteIds() {
  const { data } = await api.get<{ listingIds: string[]; centerIds: string[] }>("/favorites/ids");
  return data;
}

export async function fetchFavoriteListings() {
  const { data } = await api.get<{ listings: Listing[] }>("/favorites/listings");
  return data.listings;
}

export async function fetchFavoriteCenters() {
  const { data } = await api.get<{ centers: User[] }>("/favorites/centers");
  return data.centers;
}
