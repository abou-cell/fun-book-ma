import { NextResponse } from "next/server";

import type { SessionPayload } from "@/lib/auth/session";
import { createSessionCookie } from "@/lib/auth/session";

export function validationErrorResponse(details: Record<string, string[] | undefined>) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details,
    },
    { status: 400 },
  );
}

export async function createSessionForUser(payload: Omit<SessionPayload, "iat" | "exp">) {
  await createSessionCookie(payload);
}
