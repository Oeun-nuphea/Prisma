import { Router } from "express";
import * as NoteController from "../controller/note.controller";
import { authHandler } from "../middlewares/auth-handler.middleware";
import { validate } from "../middlewares/validate";
import { CreateNoteSchema, UpdateNoteSchema } from "../schemas/note.schema";
import { csrfGuard } from "../middlewares/csrf.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note CRUD — requires Bearer token
 */

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Note
 *               body:
 *                 type: string
 *                 example: This is the content
 *     responses:
 *       201:
 *         description: Note created
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  csrfGuard,
  authHandler,
  validate(CreateNoteSchema),
  NoteController.createNote,
);

/**
 * @swagger
 * /notes/one-user:
 *   get:
 *     summary: Get all notes for the authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Unauthorized
 */
router.get("/one-user", authHandler, NoteController.getNotesByOneUser);

/**
 * @swagger
 * /notes/one-user/{id}:
 *   get:
 *     summary: Get a single note by ID (must belong to the user)
 *     tags: [Notes]
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
 *         description: Note data
 *       403:
 *         description: Forbidden — note belongs to another user
 *       404:
 *         description: Note not found
 *   patch:
 *     summary: Update a note by ID (must belong to the user)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.get("/one-user/:id", authHandler, NoteController.getNoteById);
router.patch(
  "/one-user/:id",
  authHandler,
  validate(UpdateNoteSchema),
  NoteController.updateNote,
);

/**
 * @swagger
 * /notes/one-user/{id}/delete:
 *   patch:
 *     summary: Soft delete a note (must belong to the user)
 *     tags: [Notes]
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
 *         description: Note deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.patch(
  "/one-user/:id/delete",
  csrfGuard,
  authHandler,
  NoteController.deleteNote,
);

/**
 * @swagger
 * /notes/one-user/{id}/favorite:
 *   patch:
 *     summary: Toggle a note's favorite status (must belong to the user)
 *     tags: [Notes]
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
 *         description: Note favorite status toggled successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.patch(
  "/one-user/:id/favorite",
  csrfGuard,
  authHandler,
  NoteController.toggleNoteFavorite,
);
/**
 * @swagger
 * /notes/one-user/{id}/share:
 *   post:
 *     summary: Generate a shareable link for a note (must belong to the user)
 *     tags: [Notes]
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
 *         description: Share URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareUrl:
 *                   type: string
 *                   example: http://localhost:4000/notes/shared/abc123token
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.post(
  "/one-user/:id/share",
  csrfGuard,
  authHandler,
  NoteController.shareNoteHandler,
);

/**
 * @swagger
 * /notes/shared/{token}:
 *   get:
 *     summary: View a shared note by token (no auth required)
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique share token
 *     responses:
 *       200:
 *         description: Note data
 *       404:
 *         description: Note not found or deleted
 */
router.get("/shared/:token", NoteController.getNoteByTokenHandler);

export default router;
