import { z } from "zod";
export const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Gunakan tautan HTTPS yang valid.");
export const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    return (
      !value ||
      /^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value) ||
      /^\/api\/media\/[a-f0-9]{24}$/.test(value) ||
      safeUrl.safeParse(value).success
    );
  }, "Gunakan URL gambar HTTPS atau gambar yang diunggah.");
const tags = z
  .array(z.string().trim().min(1).max(40))
  .max(12)
  .transform((items) => [...new Set(items)]);
export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi.").max(80),
    category: z.enum(["android", "unity"]),
    description: z.string().trim().max(600),
    image: imageUrl,
    tags,
    year: z.string().regex(/^20\d{2}$/, "Tahun harus berupa 4 angka (20xx)."),
    downloadUrl: safeUrl,
    githubUrl: safeUrl,
    playUrl: safeUrl,
    published: z.boolean(),
    order: z.number().int().min(0).max(9999),
    sample: z.boolean(),
  })
  .strict();
export const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    role: z.string().trim().min(1).max(80),
    headline: z.string().trim().min(1).max(70),
    headlineAccent: z.string().trim().min(1).max(70),
    intro: z.string().trim().max(350),
    aboutTitle: z.string().trim().min(1).max(150),
    aboutText: z.string().trim().max(3000),
    location: z.string().trim().max(60),
    email: z.union([z.literal(""), z.string().trim().email().max(254)]),
    githubUrl: safeUrl,
    linkedinUrl: safeUrl,
    heroImage: imageUrl,
    heroSecondaryImage: imageUrl,
    contactTitle: z.string().trim().min(1).max(150),
    skills: tags,
    liquidEnabled: z.boolean(),
  })
  .strict();
export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();

export const accountSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email tidak valid.").max(254),
    currentPassword: z.string().min(1, "Masukkan password saat ini.").max(256),
    newPassword: z.union([
      z.literal(""),
      z.string().min(10, "Password baru minimal 10 karakter.").max(256),
    ]),
    confirmPassword: z.string().max(256),
  })
  .strict()
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirmPassword"],
  });
