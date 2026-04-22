import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

import { SettingsForm } from "./SettingsForm";

export default async function ProviderSettingsPage() {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true } });

  return (
    <>
      <ProviderHeader title="Provider settings" description="Keep your business profile and contact details up to date." />
      <SettingsForm initialValues={{
        businessName: provider.businessName,
        city: provider.city,
        description: provider.description,
        phone: provider.phone ?? "",
        whatsapp: provider.whatsapp ?? "",
        email: dbUser?.email ?? user.email,
        commissionRate: provider.commissionRate.toString(),
      }} />
    </>
  );
}
