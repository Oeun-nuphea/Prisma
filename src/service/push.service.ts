import webpush from "web-push";
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/db";

if (
  !process.env.VAPID_SUBJECT ||
  !process.env.VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY
) {
  throw new Error("Missing VAPID environment variables");
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

const adminNotificationClient = (prisma as unknown as PrismaClient)
  .adminNotification;

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  type?: string;
  meta?: Record<string, unknown>;
};

type SubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

class PushService {
  async saveAdminPushSubscription(
    adminId: number,
    subscription: SubscriptionInput,
  ) {
    return prisma.adminPushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        adminId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isDeleted: false,
      },
      create: {
        adminId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isDeleted: false,
      },
    });
  }

  async deletePushSubscription(endpoint: string) {
    return prisma.adminPushSubscription.updateMany({
      where: { endpoint },
      data: { isDeleted: true },
    });
  }

  async sendPushToAdmin(adminId: number, payload: PushPayload) {
    const subscriptions = await prisma.adminPushSubscription.findMany({
      where: {
        adminId,
        isDeleted: false,
      },
    });

    await adminNotificationClient.create({
      data: {
        adminId,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        type: payload.type,
        meta: payload.meta as Prisma.InputJsonValue | undefined,
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload),
        ),
      ),
    );

    await Promise.all(
      results.map(async (result, index) => {
        if (result.status === "rejected") {
          const error = result.reason as { statusCode?: number };

          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await prisma.adminPushSubscription.updateMany({
              where: { endpoint: subscriptions[index].endpoint },
              data: { isDeleted: true },
            });
          }
        }
      }),
    );

    return results;
  }

  async getAllNotification(
    adminId: number,
    options?: { unreadOnly?: boolean; page?: number; limit?: number },
  ) {
    const { unreadOnly = false, page = 1, limit = 10 } = options ?? {};
    const where = {
      adminId,
      ...(unreadOnly ? { isRead: false } : {}),
      isDeleted: false,
    };

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const [notifications, totalCount] = await Promise.all([
      adminNotificationClient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
      }),
      adminNotificationClient.count({ where }),
    ]);

    const pageCount = Math.max(1, Math.ceil(totalCount / safeLimit));

    return {
      data: notifications,
      meta: {
        currentPage: safePage,
        isFirstPage: safePage <= 1,
        isLastPage: safePage >= pageCount,
        nextPage: safePage < pageCount ? safePage + 1 : null,
        previousPage: safePage > 1 ? safePage - 1 : null,
        pageCount,
        totalCount,
      },
    };
  }

  async markNotificationAsRead(notificationId: number, adminId: number) {
    return adminNotificationClient.updateMany({
      where: {
        id: notificationId,
        adminId,
        isDeleted: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllNotificationsAsRead(adminId: number) {
    return adminNotificationClient.updateMany({
      where: {
        adminId,
        isRead: false,
        isDeleted: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async deleteNotification(notificationId: number, adminId: number) {
    return adminNotificationClient.updateMany({
      where: {
        id: notificationId,
        adminId,
      },
      data: { isDeleted: true },
    });
  }

  async getUnreadCount(adminId: number) {
    return adminNotificationClient.count({
      where: {
        adminId,
        isRead: false,
        isDeleted: false,
      },
    });
  }
}

export default new PushService();
