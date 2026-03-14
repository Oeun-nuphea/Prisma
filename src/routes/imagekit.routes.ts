import { Router } from "express";
import { uploadImage, uploadMiddleware } from "../controller/imagekit.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Central image upload endpoint for all CRUDs
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload one or multiple images
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The image files to upload
 *               folder:
 *                 type: string
 *                 description: Folder to save images in ImageKit (e.g., "notes", "users")
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: No files uploaded
 */
router.post("/", uploadMiddleware, uploadImage);

export default router;