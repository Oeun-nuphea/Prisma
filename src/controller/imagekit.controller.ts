import { Request, Response } from "express";
import multer from "multer";
import { uploadFile } from "../service/imagekit.service";

const upload = multer({ storage: multer.memoryStorage() });

// Central upload handler
export const uploadImage = async (req: Request, res: Response) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const folder = req.body.folder || "/uploads"; // e.g., "notes", "users"
  const uploadedUrls: string[] = [];

  for (const file of req.files as Express.Multer.File[]) {
    const url = await uploadFile(file.buffer, file.originalname, folder);
    uploadedUrls.push(url);
  }

  res.json({ message: "Files uploaded successfully", urls: uploadedUrls });
};

// Export multer middleware for route
export const uploadMiddleware = upload.array("files", 10);