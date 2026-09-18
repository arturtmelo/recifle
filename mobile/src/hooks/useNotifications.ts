import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notifications.api";
import { getSocket } from "../services/socket";

export function useNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
    socket.on("notification:new", invalidate);
    return () => {
      socket.off("notification:new", invalidate);
    };
  }, [queryClient]);

  return useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications, refetchInterval: 30000 });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
