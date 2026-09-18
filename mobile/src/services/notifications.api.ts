import { api } from "./api";
import { AppNotification } from "../types";

export async function fetchNotifications() {
  const { data } = await api.get<{ notifications: AppNotification[] }>("/notifications");
  return data.notifications;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<{ notification: AppNotification }>(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all");
}
