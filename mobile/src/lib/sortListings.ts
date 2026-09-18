import { Listing } from "../types";

export type SortKey = "relevancia" | "distancia" | "menor_preco" | "recente";

export function sortListings(listings: Listing[], sort: SortKey): Listing[] {
  const copy = [...listings];
  switch (sort) {
    case "distancia":
      return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    case "menor_preco":
      return copy.sort((a, b) => (a.pricePerKg ?? 0) - (b.pricePerKg ?? 0));
    case "recente":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    default:
      return copy;
  }
}

export function filterByPriceRange(listings: Listing[], minPrice?: number, maxPrice?: number): Listing[] {
  if (minPrice === undefined && maxPrice === undefined) return listings;
  return listings.filter((l) => {
    if (l.priceType === "DOACAO") return minPrice === undefined || minPrice === 0;
    const price = l.pricePerKg ?? 0;
    if (minPrice !== undefined && price < minPrice) return false;
    if (maxPrice !== undefined && price > maxPrice) return false;
    return true;
  });
}
