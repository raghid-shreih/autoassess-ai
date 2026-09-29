import sharp from "sharp";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_CLAIMS = 50;

export async function normalizeImage(imageData: string): Promise<string> {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageData);
  if (!match || match[2].length % 4 !== 0) throw new Error("Use a JPG, PNG or WEBP image.");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Image must be 10 MB or smaller.");
  if (bytes.toString("base64") !== match[2]) throw new Error("Invalid image encoding.");
  try {
    const image = sharp(bytes, { limitInputPixels: 16_000_000, animated: false, failOn: "warning" });
    const metadata = await image.metadata();
    if (metadata.format !== match[1] || (metadata.pages ?? 1) > 1) throw new Error("Invalid image format.");
    // Decode the image, strip metadata and bound stored payload size.
    const normalized = await image.rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70 }).toBuffer();
    return `data:image/jpeg;base64,${normalized.toString("base64")}`;
  } catch {
    throw new Error("Image is invalid or exceeds the 16 megapixel limit.");
  }
}
