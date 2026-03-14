import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// Function to upload a file
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folder = "/uploads"
): Promise<string> => {
  try {
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder,
    });
    return response.url; // public URL
  } catch (err) {
    console.error("ImageKit upload error:", err);
    throw err;
  }
};

export default imagekit;