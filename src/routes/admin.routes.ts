import { Router } from "express";
import * as AdminController from "../controller/admin.controller";
import { validate } from "../middlewares/validate";
import { LoginAdminSchema } from "../schemas/admin.schema";

const router = Router();

/**
 * POST /admin/login
 * Admin login — requires email, password, and privateKey
 */
router.post("/login", validate(LoginAdminSchema), AdminController.loginAdmin);

/**
 * GET /admin/users
 * List all users (admin only)
 */
router.get("/users", AdminController.getUsers);

/**
 * GET /admin/users/:id
 * Get single user by ID (admin only)
 */
router.get("/users/:id", AdminController.getUserById);

export default router;
