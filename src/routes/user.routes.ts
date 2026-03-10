import { Router } from "express";
import * as UserController from "../controller/user.controller";
import { validate } from "../middlewares/validate";
import { authHandler } from "../middlewares/auth-handler";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginUserSchema,
} from "../schemas/user.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User registration, login and management
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
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
router.post("/", validate(CreateUserSchema), UserController.createUser);

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
router.delete("/:id", authHandler, UserController.deleteUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login as a user
 *     tags: [Users]
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
router.post("/login", validate(LoginUserSchema), UserController.loginUser);

export default router;
