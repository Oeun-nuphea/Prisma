import { Router } from "express";
import * as UserController from "../controller/user.controller";

const router = Router();

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.patch("/:id", UserController.updateUser);
router.patch("/:id/delete", UserController.deleteUser);
router.post("/login", UserController.loginUser);

export default router;