import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadFile, deleteFile } from "../service/imagekit.service";

const upload = multer({ storage: multer.memoryStorage() });

// ─── Middleware exports ────────────────────────────────────────────────────────
export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

// ─── Single upload (avatar) ────────────────────────────────────────────────────
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { url, fileId } = await uploadFile(req.file, "/avatars");

    // TODO: save url + fileId to user record
    // await userService.updateAvatar(req.user.id, url, fileId);

    res.json({ url, fileId });
  } catch (err) {
    next(err); // let error-handler.middleware handle it
  }
};

// ─── Multiple upload (note images) ────────────────────────────────────────────
export const uploadNoteImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Upload all in parallel — faster than sequential for loop
    const results = await Promise.all(
      files.map((file) => uploadFile(file, "/notes"))
    );

    // TODO: save results to note record
    // await noteService.attachImages(req.body.noteId, results);

    res.json({ uploads: results }); // [{ url, fileId }, ...]
  } catch (err) {
    next(err);
  }
};

// ─── Delete image ──────────────────────────────────────────────────────────────
export const removeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileId = req.params.fileId as string; // 👈 cast here

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    await deleteFile(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
};