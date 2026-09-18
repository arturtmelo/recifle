import { api } from "./api";
import { User } from "../types";

export type CenterFilters = {
  materialType?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export async function fetchCenters(filters: CenterFilters = {}) {
  const { data } = await api.get<{ centers: User[] }>("/centers", { params: filters });
  return data.centers;
}

export async function fetchCenter(id: string) {
  const { data } = await api.get<{ center: User }>(`/centers/${id}`);
  return data.center;
}

export type UpdateCenterPayload = {
  description?: string;
  openingHours?: string;
  materials?: string[];
  addressText?: string;
  lat?: number;
  lng?: number;
};

export async function updateMyCenter(payload: UpdateCenterPayload) {
  const { data } = await api.patch<{ user: User }>("/centers/me", payload);
  return data.user;
}
