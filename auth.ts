import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/auth/password";
import { env } from "@/lib/env";
import { logger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/auth/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  secret: env.AUTH_SECRET,
  debug: env.isDevelopment,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          logger.warn("Invalid login payload", { reason: "schema_validation" });
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          logger.info("Login failed", { reason: "user_not_found" });
          return null;
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          logger.info("Login failed", { reason: "invalid_password", userId: user.id });
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;

        return token;
      }

      if (!token.sub) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true },
      });

      token.role = dbUser?.role ?? UserRole.CLIENT;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.CLIENT;
      }

      return session;
    },
  },
});
