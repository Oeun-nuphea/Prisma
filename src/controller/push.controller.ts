import { Request, Response, NextFunction } from "express";
import {
  GetAdminNotificationsQueryDto,
  SendPushBodyDto,
  SubscribeAdminPushDto,
  UnsubscribePushDto,
} from "../dto/push.dto";
import pushService from "../service/push.service";
import { AdminRequest } from "../middlewares/role.middleware";

class PushController {
  getAdminNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const adminId = (req as AdminRequest).adminId;
      const validatedQuery =
        (res.locals.validatedQuery as GetAdminNotificationsQueryDto | undefined) ??
        {};

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const query: GetAdminNotificationsQueryDto = {
        page: validatedQuery.page ?? 1,
        limit: validatedQuery.limit ?? 10,
        unreadOnly: validatedQuery.unreadOnly ?? false,
      };

      const result = await pushService.getAllNotification(adminId, query);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

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

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as AdminRequest).adminId;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const unreadCount = await pushService.getUnreadCount(adminId);

      return res.status(200).json({ data: { unreadCount } });
    } catch (error) {
      next(error);
    }
  };

  markNotificationAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const adminId = (req as AdminRequest).adminId;
      const notificationId = Number(req.params.notificationId);

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        return res.status(400).json({ message: "Invalid notificationId" });
      }

      const result = await pushService.markNotificationAsRead(
        notificationId,
        adminId,
      );

      if (result.count === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  };

  markAllNotificationsAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const adminId = (req as AdminRequest).adminId;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await pushService.markAllNotificationsAsRead(adminId);

      return res.status(200).json({
        message: "All notifications marked as read",
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const adminId = (req as AdminRequest).adminId;
      const notificationId = Number(req.params.notificationId);

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        return res.status(400).json({ message: "Invalid notificationId" });
      }

      const result = await pushService.deleteNotification(notificationId, adminId);

      if (result.count === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({ message: "Notification deleted" });
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
