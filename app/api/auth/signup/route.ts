import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { createSessionForUser, validationErrorResponse } from "@/lib/auth/http";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

type CreatedUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { name, email, password, role } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const createdRows = await prisma.$queryRaw<CreatedUserRecord[]>`
      INSERT INTO "User" (name, email, password, role, "createdAt", "updatedAt")
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}::"UserRole", NOW(), NOW())
      RETURNING id, name, email, role
    `;
    const user = createdRows[0];

    if (!user) {
      return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
    }

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

    await createSessionForUser({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
