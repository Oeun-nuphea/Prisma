import ImageKit from "imagekit";
import path from "path";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// Allowed image types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (
  file: Express.Multer.File,
  folder = "/uploads"
): Promise<{ url: string; fileId: string }> => {

  // 1. Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}`);
  }

  // 2. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max size is 5MB`);
  }

  // 3. Sanitize filename (no spaces/special chars)
  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${Date.now()}-${baseName}${ext}`;

  const response = await imagekit.upload({
    file: file.buffer,
    fileName,
    folder,
    // 4. Auto-tag by folder for easier management in ImageKit dashboard
    tags: [folder.replace("/", "")],
  });

  // 5. Return both url and fileId (fileId needed for deletion later)
  return {
    url: response.url,
    fileId: response.fileId,
  };
};

// 6. Delete helper — you'll need this for avatar replacement, note cleanup
export const deleteFile = async (fileId: string): Promise<void> => {
  await imagekit.deleteFile(fileId);
};

export default imagekit;