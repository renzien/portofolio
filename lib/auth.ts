import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db, databaseConfigured } from "./db";
export const SESSION_COOKIE = "alif_admin_session";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function currentAdmin() {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const database = await db();
  const session = await database
    .collection("sessions")
    .findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const admin = await database
    .collection("admins")
    .findOne({ _id: session.adminId });
  if (
    !admin ||
    (session.credentialVersion ?? 0) !== (admin.credentialVersion ?? 0)
  )
    return null;
  return { id: String(admin._id), email: String(admin.email) };
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new ApiError(401, "Sesi berakhir. Silakan masuk kembali.");
  return admin;
}
export async function createSession(
  adminId: import("mongodb").ObjectId,
  credentialVersion: number,
) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await (
    await db()
  )
    .collection("sessions")
    .insertOne({
      tokenHash: digest(token),
      adminId,
      credentialVersion,
      expiresAt,
    });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = [
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]
    .filter(Boolean)
    .map((url) => new URL(url!).origin);
  if (process.env.NODE_ENV !== "production")
    allowed.push(new URL(request.url).origin);
  if (!origin || !allowed.includes(origin))
    throw new ApiError(
      403,
      "Permintaan berasal dari alamat yang tidak diizinkan.",
    );
}
export async function limitedJson(request: Request) {
  const max = 32768;
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new ApiError(413, "Data terlalu besar.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Format data harus JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Data kosong.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) {
      await reader.cancel();
      throw new ApiError(413, "Data terlalu besar.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "Format data tidak valid.");
  }
}
