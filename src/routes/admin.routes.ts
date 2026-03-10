import { Router } from "express";
import * as AdminController from "../controller/admin.controller";
import { validate } from "../middlewares/validate";
import { LoginAdminSchema } from "../schemas/admin.schema";
import { adminHandler } from "../middlewares/admin-handle";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin login and user management
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, privateKey]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin1234
 *               privateKey:
 *                 type: string
 *                 example: supersecretadminkey123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Invalid private key
 */
router.post("/login", validate(LoginAdminSchema), AdminController.loginAdmin);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not an admin
 */
router.get("/users", adminHandler, AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not an admin
 *       404:
 *         description: User not found
 */
router.get("/users/:id", adminHandler, AdminController.getUserById);

export default router;
