import { Request, Response, NextFunction } from "express";
import pushService, { PushPayload } from "../service/push.service";

class PushController {
  async subscribeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.admin?.id ?? req.body.adminId;
      const subscription = req.body;

      if (!adminId) {
        return res.status(400).json({
          message: "adminId is required",
        });
      }

      if (
        !subscription?.endpoint ||
        !subscription?.keys?.p256dh ||
        !subscription?.keys?.auth
      ) {
        return res.status(400).json({
          message: "Invalid push subscription payload",
        });
      }

      const saved = await pushService.saveAdminPushSubscription(
        Number(adminId),
        subscription
      );

      return res.status(200).json({
        message: "Push subscription saved successfully",
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({
          message: "endpoint is required",
        });
      }

      await pushService.deletePushSubscription(endpoint);

      return res.status(200).json({
        message: "Push subscription removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async sendToAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.params.adminId || req.body.adminId;
      const payload = req.body.payload as PushPayload;

      if (!adminId) {
        return res.status(400).json({
          message: "adminId is required",
        });
      }

      if (!payload?.title || !payload?.body) {
        return res.status(400).json({
          message: "payload.title and payload.body are required",
        });
      }

      const result = await pushService.sendPushToAdmin(Number(adminId), payload);

      return res.status(200).json({
        message: "Push notification sent",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PushController();