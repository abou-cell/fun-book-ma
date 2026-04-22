import type { EmailPayload } from "@/lib/email/types";
import { mockEmailSender } from "@/lib/email/mock-email-sender";

type EmailSendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
};

function normalizeRecipient(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeEmailPayload(payload: EmailPayload): EmailPayload | null {
  const recipient = normalizeRecipient(payload.to);

  if (!isValidEmail(recipient) || !payload.subject.trim() || !payload.html.trim()) {
    return null;
  }

  return {
    ...payload,
    to: recipient,
    subject: payload.subject.trim(),
  };
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const safePayload = sanitizeEmailPayload(payload);

  if (!safePayload) {
    return {
      ok: false,
      skipped: true,
      reason: "invalid_payload",
    };
  }

  try {
    await mockEmailSender.send(safePayload);

    return {
      ok: true,
    };
  } catch (error) {
    console.error("[email] failed to send", {
      to: safePayload.to,
      subject: safePayload.subject,
      error,
    });

    return {
      ok: false,
      reason: "send_failure",
    };
  }
}
