import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { createSessionForUser, validationErrorResponse } from "@/lib/auth/http";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

type LoginUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const userRows = await prisma.$queryRaw<LoginUserRecord[]>`
      SELECT id, name, email, role, password
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSessionForUser({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
