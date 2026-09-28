import { MongoClient } from "mongodb";
import { readFile } from "node:fs/promises";
import { hashPassword } from "../lib/password.mjs";
const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI)
  throw new Error("Isi MONGODB_URI di .env.local terlebih dahulu.");
let bootstrap;
try {
  bootstrap = JSON.parse(
    await readFile(
      new URL("../.admin-bootstrap.json", import.meta.url),
      "utf8",
    ),
  );
} catch (error) {
  if (error.code !== "ENOENT")
    throw new Error("File akun awal tidak dapat dibaca.");
}
const email = (ADMIN_EMAIL || bootstrap?.email || "").trim().toLowerCase();
const reset = process.argv.includes("--reset-password");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
  throw new Error("Email admin tidak valid.");
if (
  ADMIN_PASSWORD &&
  (ADMIN_PASSWORD.length < 10 ||
    ADMIN_PASSWORD.length > 256 ||
    ADMIN_PASSWORD.startsWith("REPLACE_"))
)
  throw new Error("Gunakan password sepanjang 10–256 karakter.");
if (reset && !ADMIN_PASSWORD)
  throw new Error(
    "Untuk reset, isi ADMIN_PASSWORD dengan password baru di .env.local.",
  );
if (
  !ADMIN_PASSWORD &&
  (email !== bootstrap?.email ||
    !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(bootstrap?.passwordHash || ""))
)
  throw new Error(
    "Isi ADMIN_EMAIL dan ADMIN_PASSWORD di .env.local atau gunakan file akun awal dari ZIP.",
  );
const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "alif_portfolio");
  await Promise.all([
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db
      .collection("sessions")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("loginAttempts").createIndex({ key: 1 }, { unique: true }),
    db
      .collection("loginAttempts")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("projects").createIndex({ id: 1 }, { unique: true }),
    db.collection("projects").createIndex({ published: 1, order: 1 }),
    db.collection("settings").createIndex({ key: 1 }, { unique: true }),
  ]);
  const existing = await db.collection("admins").findOne({ email });
  if (!existing) {
    if (reset)
      throw new Error(
        "Email admin tidak ditemukan. Isi ADMIN_EMAIL dengan email login saat ini.",
      );
    if (await db.collection("admins").findOne({}))
      throw new Error(
        "Admin sudah tersedia dengan email lain. Gunakan menu Akun & keamanan; seed tidak membuat akun tambahan.",
      );
    await db.collection("admins").insertOne({
      email,
      passwordHash: ADMIN_PASSWORD
        ? await hashPassword(ADMIN_PASSWORD)
        : bootstrap.passwordHash,
      credentialVersion: 0,
      createdAt: new Date(),
    });
    console.log("Admin dibuat. Password disimpan sebagai hash scrypt.");
  } else if (reset) {
    await db
      .collection("admins")
      .updateOne(
        { _id: existing._id },
        {
          $set: {
            passwordHash: await hashPassword(ADMIN_PASSWORD),
            updatedAt: new Date(),
          },
          $inc: { credentialVersion: 1 },
        },
      );
    await db.collection("sessions").deleteMany({ adminId: existing._id });
    console.log("Password diubah dan semua sesi admin tersebut dicabut.");
  } else console.log("Admin sudah ada; akun dan password tidak diubah.");
  console.log(
    "Database siap. Buka /admin untuk mengisi profil dan menambah proyek. Tidak ada proyek contoh yang dipublikasikan.",
  );
} finally {
  await client.close();
}
