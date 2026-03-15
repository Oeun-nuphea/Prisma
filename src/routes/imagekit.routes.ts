import { Router } from "express";
import { authHandler } from "../middlewares/auth-handler.middleware";
import {
  uploadSingle,
  uploadMultiple,
  uploadAvatar,
  uploadNoteImages,
  removeImage,
} from "../controller/imagekit.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload endpoints
 */

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload a single user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 fileId:
 *                   type: string
 *       400:
 *         description: No file uploaded
 */
router.post("/avatar", authHandler, uploadSingle, uploadAvatar);

/**
 * @swagger
 * /upload/notes:
 *   post:
 *     summary: Upload one or multiple note images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       fileId:
 *                         type: string
 *       400:
 *         description: No files uploaded
 */
router.post("/notes", authHandler, uploadMultiple, uploadNoteImages);

/**
 * @swagger
 * /upload/{fileId}:
 *   delete:
 *     summary: Delete an image from ImageKit
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ImageKit fileId to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: fileId is required
 */
router.delete("/:fileId", authHandler, removeImage);

export default router;