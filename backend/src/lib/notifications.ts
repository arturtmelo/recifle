import { prisma } from "./prisma";
import { NotificationType } from "./constants";
import { getIO } from "./io";

export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
    },
  });

  getIO()?.to(`user:${userId}`).emit("notification:new", notification);

  return notification;
}
