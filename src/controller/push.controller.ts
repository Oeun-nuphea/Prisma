import { Request, Response, NextFunction } from "express";
import {
  SendPushBodyDto,
  SubscribeAdminPushDto,
  UnsubscribePushDto,
} from "../dto/push.dto";
import pushService from "../service/push.service";
import { AdminRequest } from "../middlewares/role.middleware";

class PushController {
  subscribeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as AdminRequest).adminId;
      const subscription: SubscribeAdminPushDto = req.body;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const saved = await pushService.saveAdminPushSubscription(
        adminId,
        subscription
      );

      return res.status(200).json({
        message: "Push subscription saved successfully",
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  };

  unsubscribeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { endpoint }: UnsubscribePushDto = req.body;

      await pushService.deletePushSubscription(endpoint);

      return res.status(200).json({
        message: "Push subscription removed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  sendToAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = Number(req.params.adminId);
      const { payload }: SendPushBodyDto = req.body;

      if (isNaN(adminId) || adminId <= 0) {
        return res.status(400).json({
          message: "Invalid adminId",
        });
      }

      const result = await pushService.sendPushToAdmin(adminId, payload);

      return res.status(200).json({
        message: "Push notification sent",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PushController();
