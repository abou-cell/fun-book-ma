import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
