import { Router } from "express";
import * as NoteController from "../controller/note.controller";
import { authHandler } from "../middlewares/auth-handler";
import { validate } from "../middlewares/validate";
import { CreateNoteSchema, UpdateNoteSchema } from "../schemas/note.schema";

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
router.patch("/one-user/:id/delete", authHandler, NoteController.deleteNote);

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
  authHandler,
  NoteController.toggleNoteFavorite,
);

export default router;
