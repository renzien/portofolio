import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { checkOrigin, digest, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token)
      await (
        await db()
      )
        .collection("sessions")
        .deleteOne({ tokenHash: digest(token) });
    jar.delete(SESSION_COOKIE);
    return { ok: true };
  });
}
