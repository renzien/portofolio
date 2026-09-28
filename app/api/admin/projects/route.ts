import { randomUUID } from "node:crypto";
import { api } from "@/lib/api";
import { checkOrigin, limitedJson, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    await requireAdmin();
    const project = {
      ...projectSchema.parse(await limitedJson(request)),
      id: randomUUID(),
    };
    await (await db()).collection("projects").insertOne({ ...project });
    return { project };
  });
}
