import { api } from "@/lib/api";
import { ApiError, checkOrigin, limitedJson, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  return api(async () => {
    checkOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const project = projectSchema.parse(await limitedJson(request));
    const result = await (
      await db()
    )
      .collection("projects")
      .updateOne({ id }, { $set: project });
    if (!result.matchedCount)
      throw new ApiError(404, "Proyek tidak ditemukan.");
    return { project: { ...project, id } };
  });
}
export async function DELETE(request: Request, context: Context) {
  return api(async () => {
    checkOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const result = await (await db()).collection("projects").deleteOne({ id });
    if (!result.deletedCount)
      throw new ApiError(404, "Proyek tidak ditemukan.");
    return { ok: true };
  });
}
