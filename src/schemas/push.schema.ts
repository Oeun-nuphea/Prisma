import { z } from "zod";

export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url("A valid endpoint URL is required"),
  keys: z.object({
    p256dh: z.string().min(1, "keys.p256dh is required"),
    auth: z.string().min(1, "keys.auth is required"),
  }),
});

export const UnsubscribePushSchema = z.object({
  endpoint: z.string().url("A valid endpoint URL is required"),
});

export const PushPayloadSchema = z.object({
  title: z.string().min(1, "payload.title is required"),
  body: z.string().min(1, "payload.body is required"),
  url: z.string().url("payload.url must be a valid URL").optional(),
  type: z.string().min(1, "payload.type cannot be empty").optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const SendPushSchema = z.object({
  payload: PushPayloadSchema,
});

export type PushSubscriptionInput = z.infer<typeof PushSubscriptionSchema>;
export type UnsubscribePushInput = z.infer<typeof UnsubscribePushSchema>;
export type PushPayloadInput = z.infer<typeof PushPayloadSchema>;
export type SendPushInput = z.infer<typeof SendPushSchema>;
