import type { EmailPayload, EmailSender } from "@/lib/email/types";

export const mockEmailSender: EmailSender = {
  async send(payload: EmailPayload) {
    console.info("[mock-email]", JSON.stringify(payload));
  },
};
