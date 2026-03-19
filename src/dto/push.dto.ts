// ─── Subscribe ─────────────────────────────────────────────

export interface SubscribePushDto {
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

// ─── Send Push ─────────────────────────────────────────────

export interface SendPushDto {
  title: string;
  body: string;
  url?: string;
  type?: string;
  meta?: Record<string, unknown>;
}