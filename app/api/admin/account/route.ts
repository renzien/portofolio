import { MongoServerError, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import {
  ApiError,
  checkOrigin,
  digest,
  limitedJson,
  requireAdmin,
  SESSION_COOKIE,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password.mjs";
import { accountSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  return api(async () => {
    checkOrigin(request);
    const session = await requireAdmin();
    const input = accountSchema.parse(await limitedJson(request));
    const database = await db();
    const adminId = new ObjectId(session.id);
    const bucket = await database.collection("loginAttempts").findOneAndUpdate(
      {
        key: digest(`account:${session.id}:${Math.floor(Date.now() / 900000)}`),
      },
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
    const admin = await database.collection("admins").findOne({ _id: adminId });
    if (
      !admin ||
      !(await verifyPassword(input.currentPassword, admin.passwordHash))
    )
      throw new ApiError(403, "Password saat ini tidak cocok.");
    if (input.email === admin.email && !input.newPassword)
      throw new ApiError(
        400,
        "Ubah email atau isi password baru terlebih dahulu.",
      );
    const passwordHash = input.newPassword
      ? await hashPassword(input.newPassword)
      : admin.passwordHash;
    try {
      // Compare the credential snapshot to prevent two overlapping updates from overwriting each other.
      const result = await database.collection("admins").updateOne(
        {
          _id: adminId,
          email: admin.email,
          passwordHash: admin.passwordHash,
          credentialVersion: admin.credentialVersion ?? { $exists: false },
        },
        {
          $set: { email: input.email, passwordHash, updatedAt: new Date() },
          $inc: { credentialVersion: 1 },
        },
      );
      if (!result.matchedCount)
        throw new ApiError(
          409,
          "Akun baru saja berubah. Masuk kembali dan coba lagi.",
        );
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        throw new ApiError(409, "Email tersebut sudah digunakan akun lain.");
      throw error;
    }
    // Version checking invalidates old sessions immediately, even if cleanup is delayed.
    await database
      .collection("sessions")
      .deleteMany({
        adminId,
        $or: [
          { credentialVersion: { $exists: false } },
          { credentialVersion: { $lte: admin.credentialVersion ?? 0 } },
        ],
      })
      .catch(() => {});
    (await cookies()).delete(SESSION_COOKIE);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
