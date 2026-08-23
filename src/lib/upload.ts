import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

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
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
