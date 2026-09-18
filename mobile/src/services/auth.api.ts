import { api } from "./api";
import { Role, User } from "../types";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  addressText?: string;
  lat?: number;
  lng?: number;
};

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/register", payload);
  return data;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
  return data;
}

export async function meRequest() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}
