import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/validation";
import { AppError, handleRouteError } from "@/lib/errors/http";
import { logger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/security/rate-limit";

const SIGNUP_LIMIT = 10;
const SIGNUP_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(
      buildRateLimitKey(["signup", request.headers.get("x-forwarded-for") ?? "anonymous"]),
      SIGNUP_LIMIT,
      SIGNUP_WINDOW_MS,
    );

    if (!rateLimit.ok) {
      throw new AppError("Too many sign up attempts. Please try again later.", 429, "RATE_LIMITED");
    }

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return NextResponse.json({ error: "Invalid input", fieldErrors }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (user.role === UserRole.PROVIDER) {
      await prisma.provider.create({
        data: {
          userId: user.id,
          businessName: `${user.name}'s Activities`,
          city: "To be updated",
          description: "Provider profile setup in progress.",
        },
      });
    }

    logger.info("New account created", { userId: user.id, role: user.role });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      route: "/api/auth/signup",
      fallbackMessage: "Unable to create account",
    });
  }
}
