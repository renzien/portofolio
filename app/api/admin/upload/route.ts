import sharp from "sharp";
import { api } from "@/lib/api";
import { ApiError, checkOrigin, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    await requireAdmin();
    const max = 3 * 1024 * 1024;
    if (Number(request.headers.get("content-length") || 0) > max)
      throw new ApiError(413, "Gambar maksimal 3 MB.");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        request.headers.get("content-type") || "",
      )
    )
      throw new ApiError(415, "Gunakan gambar JPG, PNG, atau WebP.");
    const reader = request.body?.getReader();
    if (!reader) throw new ApiError(400, "Gambar kosong.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new ApiError(413, "Gambar maksimal 3 MB.");
      }
      chunks.push(value);
    }
    let data: Buffer;
    try {
      // Decode and re-encode instead of trusting MIME types; strip metadata and limit image dimensions.
      const input = sharp(Buffer.concat(chunks), {
        limitInputPixels: 25000000,
        animated: false,
      });
      const metadata = await input.metadata();
      if (!["png", "jpeg", "webp"].includes(metadata.format || ""))
        throw new Error("Unsupported format");
      data = await input
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 84 })
        .toBuffer();
    } catch {
      throw new ApiError(
        400,
        "Gambar tidak valid atau dimensinya terlalu besar.",
      );
    }
    const result = await (
      await db()
    )
      .collection("media")
      .insertOne({ data, contentType: "image/webp", createdAt: new Date() });
    return { url: `/api/media/${result.insertedId.toHexString()}` };
  });
}
