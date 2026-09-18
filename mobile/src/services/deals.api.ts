import { api } from "./api";
import { Deal, DealStatus, Review } from "../types";

export async function fetchDeals() {
  const { data } = await api.get<{ deals: Deal[] }>("/deals");
  return data.deals;
}

export async function fetchDeal(id: string) {
  const { data } = await api.get<{ deal: Deal }>(`/deals/${id}`);
  return data.deal;
}

export async function updateDealStatus(id: string, status: DealStatus, scheduledAt?: string) {
  const { data } = await api.patch<{ deal: Deal }>(`/deals/${id}/status`, { status, scheduledAt });
  return data.deal;
}

export async function createReview(dealId: string, rating: number, comment?: string) {
  const { data } = await api.post<{ review: Review }>(`/deals/${dealId}/reviews`, { rating, comment });
  return data.review;
}

export async function fetchUserReviews(userId: string) {
  const { data } = await api.get<{
    reviews: { id: string; rating: number; comment: string | null; createdAt: string; from: { id: string; name: string; avatarUrl: string | null } }[];
  }>(`/users/${userId}/reviews`);
  return data.reviews;
}
