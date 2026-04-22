import type { EmailPayload } from "@/lib/email/types";
import { mockEmailSender } from "@/lib/email/mock-email-sender";

type EmailSendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
};

const EMAIL_SEND_TIMEOUT_MS = 8_000;

function normalizeRecipient(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeEmailPayload(payload: EmailPayload): EmailPayload | null {
  const recipient = normalizeRecipient(payload.to);
  const subject = payload.subject.trim();
  const html = payload.html.trim();
  const text = payload.text?.trim();

  if (!isValidEmail(recipient) || !subject || !html) {
    return null;
  }

  return {
    ...payload,
    to: recipient,
    subject,
    html,
    ...(text ? { text } : {}),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("email_send_timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
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
    await withTimeout(mockEmailSender.send(safePayload), EMAIL_SEND_TIMEOUT_MS);

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
      reason: error instanceof Error ? error.message : "send_failure",
    };
  }
}
