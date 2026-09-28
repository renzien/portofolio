import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { api } from "@/lib/api";
import {
  ApiError,
  checkOrigin,
  createSession,
  digest,
  limitedJson,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/password.mjs";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    const { email, password } = loginSchema.parse(await limitedJson(request));
    const database = await db();
    // Use an account bucket as well as an IP bucket, so varying a forwarded IP cannot bypass throttling.
    const ip = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for") || "unknown"
      : "local";
    const window = Math.floor(Date.now() / 900000);
    for (const key of [`email:${email}`, `ip:${ip}`]) {
      const bucket = await database
        .collection("loginAttempts")
        .findOneAndUpdate(
          { key: digest(`${key}:${window}`) },
          {
            $inc: { count: 1 },
            $setOnInsert: { expiresAt: new Date(Date.now() + 1800000) },
          },
          { upsert: true, returnDocument: "after" },
        );
      if ((bucket?.count || 0) > 10)
        throw new ApiError(
          429,
          "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
        );
    }
    const admin = await database.collection("admins").findOne({ email });
    const fallback = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(
      password,
      admin?.passwordHash || fallback,
    );
    if (!admin || !valid)
      throw new ApiError(401, "Email atau password tidak cocok.");
    await createSession(admin._id, admin.credentialVersion ?? 0);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
