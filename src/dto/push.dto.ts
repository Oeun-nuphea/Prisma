export interface SubscribeAdminPushDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ─── Unsubscribe ───────────────────────────────────────────

export interface UnsubscribePushDto {
  endpoint: string;
}

// ─── Push Payload ──────────────────────────────────────────

export interface PushPayloadDto {
  title: string;
  body: string;
  url?: string;
  type?: string;
  meta?: Record<string, unknown>;
}

export interface SendPushBodyDto {
  payload: PushPayloadDto;
}

export interface GetAdminNotificationsQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface AdminNotificationParamsDto {
  notificationId: number;
}
