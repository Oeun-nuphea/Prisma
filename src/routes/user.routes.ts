import { Router } from "express";
import * as UserController from "../controller/user.controller";
import { validate } from "../middlewares/validate";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginUserSchema,
} from "../schemas/user.schema";

const router = Router();

/**
 * Normal User Access
 */
router.post("/", validate(CreateUserSchema), UserController.createUser);
router.patch("/:id", validate(UpdateUserSchema), UserController.updateUser);
router.patch("/:id/delete", UserController.deleteUser);
router.post("/login", validate(LoginUserSchema), UserController.loginUser);

export default router;
