import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./auth";
export async function api(action: () => Promise<Response | unknown>) {
  try {
    const value = await action();
    return value instanceof Response
      ? value
      : NextResponse.json(value, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status =
      error instanceof ApiError
        ? error.status
        : error instanceof ZodError
          ? 400
          : 503;
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof ZodError
          ? error.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join("; ")
          : "Layanan database belum tersedia. Periksa konfigurasi atau coba lagi.";
    // Do not log raw connection errors: they can contain credentials or host details.
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
