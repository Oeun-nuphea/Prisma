import { Router } from "express";
import * as UserController from "../controller/user.controller";
import { validate } from "../middlewares/validate";
import { authHandler } from "../middlewares/auth-handler.middleware";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginUserSchema,
} from "../schemas/user.schema";
import { csrfGuard } from "../middlewares/csrf.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User registration, login and management
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login as a user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: api1@gmail.com
 *               password:
 *                 type: string
 *                 example: 123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */

router.post(
  "/login",
  csrfGuard,
  validate(LoginUserSchema),
  UserController.loginUser,
);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: api1@gmail.com
 *               password:
 *                 type: string
 *                 example: 123
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already exists
 */
router.post(
  "/",
  csrfGuard,
  validate(CreateUserSchema),
  UserController.createUser,
);



/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh access token using the refresh token cookie
 *     tags: [Users]
 *     security: []
 *     description: Reads the `refreshToken` httpOnly cookie, validates it, and returns a new access token + rotated refresh token cookie.
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: No or invalid refresh token
 *       403:
 *         description: Account deactivated
 */
router.post("/refresh", csrfGuard, UserController.refreshToken);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Clears the refresh token cookie and invalidates the session.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", csrfGuard, authHandler, UserController.logout);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     description: Permanently deactivates the authenticated user's account. Users can only delete their own account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       204:
 *         description: User successfully deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized – not authenticated
 *       403:
 *         description: Forbidden – cannot delete another user's account
 *       404:
 *         description: User not found
 */
router.delete("/:id", csrfGuard, authHandler, UserController.deleteUser);

export default router;
