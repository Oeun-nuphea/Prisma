import webpush from "web-push";
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
  process.env.VAPID_PRIVATE_KEY
);

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
    subscription: SubscriptionInput
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
          JSON.stringify(payload)
        )
      )
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
      })
    );

    return results;
  }
}

export default new PushService();