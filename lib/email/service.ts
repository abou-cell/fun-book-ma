import type { EmailPayload } from "@/lib/email/types";
import { mockEmailSender } from "@/lib/email/mock-email-sender";

export async function sendTransactionalEmail(payload: EmailPayload) {
  try {
    await mockEmailSender.send(payload);
  } catch (error) {
    console.error("[email] failed to send", error);
  }
}
