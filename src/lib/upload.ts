import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

// Stored under public/uploads so files are served statically by Next.js.
// Note: on hosts with an ephemeral/read-only filesystem (e.g. most serverless
// platforms) this won't persist across deploys — fine for a self-hosted VM,
// but swap for object storage (S3-compatible) if you deploy serverless.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Longest edge any uploaded image is allowed to keep after optimization.
// Admin-provided photos are frequently full camera/phone resolution
// (4000px+) despite never being displayed larger than the blog's content
// column, so this caps wasted bytes without visibly affecting quality.
const MAX_DIMENSION = 2000;

/** Saves an uploaded image under public/uploads and returns its public URL path. */
export async function saveUploadedImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Formato de imagem não suportado (use PNG, JPEG, WEBP ou GIF).");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Imagem muito grande (máx. 5MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // GIFs are stored as-is to preserve animation — sharp's default pipeline
  // would only process the first frame. Everything else is re-encoded to
  // WebP: auto-rotated per EXIF orientation, capped to MAX_DIMENSION, and
  // stripped of other metadata (GPS, camera info) along the way.
  if (ext === "gif") {
    const filename = `${randomUUID()}.gif`;
    await writeFile(path.join(UPLOAD_DIR, filename), inputBuffer);
    return `/uploads/${filename}`;
  }

  const optimized = await sharp(inputBuffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const filename = `${randomUUID()}.webp`;
  await writeFile(path.join(UPLOAD_DIR, filename), optimized);

  return `/uploads/${filename}`;
}
