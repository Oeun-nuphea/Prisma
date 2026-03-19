import { Router } from "express";
import PushController from "../controller/push.controller";
import { validate } from "../middlewares/validate";
import { adminHandler } from "../middlewares/role.middleware";
import { csrfGuard } from "../middlewares/csrf.middleware";
import {
  PushSubscriptionSchema,
  SendPushSchema,
  UnsubscribePushSchema,
} from "../schemas/push.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Push
 *   description: Web push subscription and notification management for admins
 */

/**
 * @swagger
 * /push/admin/subscribe:
 *   post:
 *     summary: Save or update an admin web push subscription
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [endpoint, keys]
 *             properties:
 *               endpoint:
 *                 type: string
 *                 format: uri
 *                 example: https://fcm.googleapis.com/fcm/send/example-subscription-id
 *               keys:
 *                 type: object
 *                 required: [p256dh, auth]
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                     example: BElx8K5exampleP256dhKey
 *                   auth:
 *                     type: string
 *                     example: N9exampleAuthKey
 *     responses:
 *       200:
 *         description: Push subscription saved successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin access only
 */
router.post(
  "/admin/subscribe",
  csrfGuard,
  adminHandler,
  validate(PushSubscriptionSchema),
  PushController.subscribeAdmin,
);

/**
 * @swagger
 * /push/admin/unsubscribe:
 *   post:
 *     summary: Soft delete an admin web push subscription by endpoint
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [endpoint]
 *             properties:
 *               endpoint:
 *                 type: string
 *                 format: uri
 *                 example: https://fcm.googleapis.com/fcm/send/example-subscription-id
 *     responses:
 *       200:
 *         description: Push subscription removed successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin access only
 */
router.post(
  "/admin/unsubscribe",
  csrfGuard,
  adminHandler,
  validate(UnsubscribePushSchema),
  PushController.unsubscribeAdmin,
);

/**
 * @swagger
 * /push/admin/{adminId}/send:
 *   post:
 *     summary: Send a push notification to all active subscriptions of an admin
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payload]
 *             properties:
 *               payload:
 *                 type: object
 *                 required: [title, body]
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: New note activity
 *                   body:
 *                     type: string
 *                     example: A new note was created successfully.
 *                   url:
 *                     type: string
 *                     format: uri
 *                     example: https://example.com/admin/notes
 *                   type:
 *                     type: string
 *                     example: note_created
 *                   meta:
 *                     type: object
 *                     additionalProperties: true
 *     responses:
 *       200:
 *         description: Push notification sent
 *       400:
 *         description: Validation failed or invalid adminId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin access only
 */
router.post(
  "/admin/:adminId/send",
  csrfGuard,
  adminHandler,
  validate(SendPushSchema),
  PushController.sendToAdmin,
);

export default router;
