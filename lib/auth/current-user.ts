import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const getCurrentUser = cache(async function getCurrentUser() {
  const session = await getSession();

  if (!session?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
