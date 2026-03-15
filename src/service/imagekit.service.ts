import ImageKit from "imagekit";
import nodePath from "path"; // 👈 rename import to avoid conflict

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
  ): Promise<{ url: string; fileId: string; filePath: string }> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw { status: 400, message: `Invalid file type: ${file.mimetype}` };
    }
    if (file.size > MAX_FILE_SIZE) {
      throw { status: 400, message: "File too large. Max size is 5MB" };
    }

    const ext = nodePath.extname(file.originalname);
    const baseName = nodePath
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${Date.now()}-${baseName}${ext}`;

    const response = await this.client.upload({
      file: file.buffer,
      fileName,
      folder,
      tags: [folder.replace("/", "")],
    });

    // 👇 Strip base URL — store only /avatars/filename.jpg
    const filePath = response.url.replace(
      process.env.IMAGEKIT_URL_ENDPOINT || "",
      ""
    );

    return {
      url: response.url,      // full URL — for immediate frontend display
      fileId: response.fileId,
      filePath,               // /avatars/filename.jpg — for DB storage
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.client.deleteFile(fileId);
  }

  getClient(): ImageKit {
    return this.client;
  }
}

export default new ImageKitService();