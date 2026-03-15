import { Request, Response, NextFunction } from "express";
import multer from "multer";
import ImageKitService from "../service/imagekit.service";
import UserService from "../service/user.service";

const upload = multer({ storage: multer.memoryStorage() });

class ImageKitController {
  // ─── Middleware ────────────────────────────────────────────────────────────

  uploadSingle = upload.single("file");
  uploadMultiple = upload.array("files", 10);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const { url, fileId, filePath } = await ImageKitService.uploadFile(
        req.file,
        "/avatars",
      );

      // ✅ filePath = /avatars/filename.jpg — only this goes to DB
      await UserService.updateAvatar(req.user!.id, filePath, fileId);

      // ✅ full URL returned to frontend for immediate display
      res.json({ url, fileId });
    } catch (err) {
      next(err);
    }
  };

  uploadNoteImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const results = await Promise.all(
        files.map((file) => ImageKitService.uploadFile(file, "/notes")),
      );

      // TODO: save results to note record
      // await NoteService.attachImages(req.body.noteId, results);

      res.json({ uploads: results });
    } catch (err) {
      next(err);
    }
  };

  removeImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileId = Array.isArray(req.params.fileId)
        ? req.params.fileId[0]
        : req.params.fileId;

      if (!fileId) {
        return res.status(400).json({ message: "fileId is required" });
      }

      await ImageKitService.deleteFile(fileId);
      res.json({ message: "File deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
}

export default new ImageKitController();
