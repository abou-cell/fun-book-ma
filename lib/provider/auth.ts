import { auth } from "@/auth";
import { getProviderByUserId } from "@/lib/provider/service";

export async function requireProviderSession() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role !== "PROVIDER") {
    return { error: "Forbidden", status: 403 as const };
  }

  const provider = await getProviderByUserId(userId);

  if (!provider) {
    return { error: "Provider account required", status: 403 as const };
  }

  return { provider };
}
