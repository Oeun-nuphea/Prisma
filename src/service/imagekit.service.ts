import ImageKit from "imagekit";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class ImageKitService {
  private client: ImageKit;

  constructor() {
    this.client = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = "/uploads"
  ): Promise<{ url: string; fileId: string }> {
    // 1. Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw { status: 400, message: `Invalid file type: ${file.mimetype}` };
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw { status: 400, message: "File too large. Max size is 5MB" };
    }

    // 3. Sanitize filename
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${Date.now()}-${baseName}${ext}`;

    const response = await this.client.upload({
      file: file.buffer,
      fileName,
      folder,
      tags: [folder.replace("/", "")],
    });

    return { url: response.url, fileId: response.fileId };
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.client.deleteFile(fileId);
  }

  // Raw client — only use if you need ImageKit methods not wrapped above
  getClient(): ImageKit {
    return this.client;
  }
}

export default new ImageKitService();