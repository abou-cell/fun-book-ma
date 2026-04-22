import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser({ email, name, role, password }) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      role,
      password: hashedPassword,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@funbook.ma",
    name: "FunBook Admin",
    role: UserRole.ADMIN,
    password: "AdminPass123",
  });

  const provider = await upsertUser({
    email: "provider@funbook.ma",
    name: "Atlas Adventures",
    role: UserRole.PROVIDER,
    password: "ProviderPass123",
  });

  await prisma.provider.upsert({
    where: { userId: provider.id },
    update: {
      businessName: "Atlas Adventures",
      city: "Marrakech",
      description: "Premium local guided experiences.",
    },
    create: {
      userId: provider.id,
      businessName: "Atlas Adventures",
      city: "Marrakech",
      description: "Premium local guided experiences.",
    },
  });

  await upsertUser({
    email: "client@funbook.ma",
    name: "FunBook Client",
    role: UserRole.CLIENT,
    password: "ClientPass123",
  });

  console.log(`Seeded admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
