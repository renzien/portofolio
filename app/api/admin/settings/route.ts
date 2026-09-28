import { api } from "@/lib/api";
import { checkOrigin, limitedJson, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";
export async function PUT(request: Request) {
  return api(async () => {
    checkOrigin(request);
    await requireAdmin();
    const settings = settingsSchema.parse(await limitedJson(request));
    await (
      await db()
    )
      .collection("settings")
      .updateOne({ key: "site" }, { $set: settings }, { upsert: true });
    return { settings };
  });
}
