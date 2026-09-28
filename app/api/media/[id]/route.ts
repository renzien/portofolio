import { ObjectId, Binary } from "mongodb";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id))
    return new Response("Not found", { status: 404 });
  try {
    const media = await (
      await db()
    )
      .collection("media")
      .findOne({ _id: new ObjectId(id) });
    if (!media) return new Response("Not found", { status: 404 });
    const bytes = media.data instanceof Binary ? media.data.buffer : media.data;
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
