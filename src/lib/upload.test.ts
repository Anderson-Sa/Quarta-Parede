import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { saveUploadedImage } from "./upload";

// Minimal (~70 byte) 1x1 fixtures — small enough to embed inline, real
// enough that sharp accepts them as valid image data.
const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const GIF_1X1_BASE64 = "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const savedUrls: string[] = [];

afterAll(async () => {
  await Promise.all(
    savedUrls.map((url) => unlink(path.join(process.cwd(), "public", url)).catch(() => {})),
  );
});

function makeFile(base64: string, type: string, name: string) {
  return new File([Buffer.from(base64, "base64")], name, { type });
}

describe("saveUploadedImage", () => {
  it("rejects an unsupported file type", async () => {
    const file = makeFile(PNG_1X1_BASE64, "application/pdf", "doc.pdf");
    await expect(saveUploadedImage(file)).rejects.toThrow(/não suportado/);
  });

  it("rejects a file over the 5MB limit", async () => {
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    const file = new File([big], "big.png", { type: "image/png" });
    await expect(saveUploadedImage(file)).rejects.toThrow(/muito grande/);
  });

  it("saves a PNG, re-encoding it to webp", async () => {
    const file = makeFile(PNG_1X1_BASE64, "image/png", "pixel.png");
    const url = await saveUploadedImage(file);
    savedUrls.push(url);

    expect(url).toMatch(/^\/uploads\/[\w-]+\.webp$/);
    const saved = await readFile(path.join(process.cwd(), "public", url));
    expect(saved.length).toBeGreaterThan(0);
  });

  it("saves a JPEG, re-encoding it to webp", async () => {
    // sharp can re-encode from PNG input regardless of the claimed mime type,
    // so this reuses the PNG fixture bytes to exercise the JPEG branch of
    // the extension allow-list without needing a separate binary fixture.
    const file = makeFile(PNG_1X1_BASE64, "image/jpeg", "pixel.jpg");
    const url = await saveUploadedImage(file);
    savedUrls.push(url);

    expect(url).toMatch(/^\/uploads\/[\w-]+\.webp$/);
  });

  it("saves a GIF as-is, without re-encoding to webp", async () => {
    const file = makeFile(GIF_1X1_BASE64, "image/gif", "pixel.gif");
    const url = await saveUploadedImage(file);
    savedUrls.push(url);

    expect(url).toMatch(/^\/uploads\/[\w-]+\.gif$/);
    const saved = await readFile(path.join(process.cwd(), "public", url));
    expect(saved.equals(Buffer.from(GIF_1X1_BASE64, "base64"))).toBe(true);
  });

  it("generates a distinct filename for each upload", async () => {
    const fileA = makeFile(PNG_1X1_BASE64, "image/png", "a.png");
    const fileB = makeFile(PNG_1X1_BASE64, "image/png", "b.png");
    const [urlA, urlB] = await Promise.all([saveUploadedImage(fileA), saveUploadedImage(fileB)]);
    savedUrls.push(urlA, urlB);

    expect(urlA).not.toBe(urlB);
  });
});
