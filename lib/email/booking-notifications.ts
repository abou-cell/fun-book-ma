import { formatCurrencyMAD } from "@/lib/booking/utils";
import { sendTransactionalEmail } from "@/lib/email/service";
import {
  customerBookingConfirmationTemplate,
  customerPaymentConfirmationTemplate,
  providerNewBookingNotificationTemplate,
} from "@/lib/email/templates/booking";

type NotificationContext = {
  customerName: string;
  customerEmail: string;
  providerEmail?: string | null;
  bookingId: string;
  activityTitle: string;
  amount: number;
};

function trackNotificationFailure(type: string, result: Awaited<ReturnType<typeof sendTransactionalEmail>>) {
  if (result.ok) {
    return;
  }

  console.warn("[email] notification not delivered", {
    type,
    skipped: result.skipped,
    reason: result.reason,
  });
}

export async function sendBookingCreatedEmails(context: NotificationContext) {
  const amount = formatCurrencyMAD(context.amount);
  const customerTemplate = customerBookingConfirmationTemplate({
    customerName: context.customerName,
    bookingId: context.bookingId,
    activityTitle: context.activityTitle,
    amount,
  });

  const emailJobs: Promise<void>[] = [];

  emailJobs.push(
    sendTransactionalEmail({
      to: context.customerEmail,
      ...customerTemplate,
    }).then((customerResult) => {
      trackNotificationFailure("booking_customer", customerResult);
    }),
  );

  if (context.providerEmail) {
    const providerTemplate = providerNewBookingNotificationTemplate({
      customerName: context.customerName,
      bookingId: context.bookingId,
      activityTitle: context.activityTitle,
      amount,
    });

    emailJobs.push(
      sendTransactionalEmail({
        to: context.providerEmail,
        ...providerTemplate,
      }).then((providerResult) => {
        trackNotificationFailure("booking_provider", providerResult);
      }),
    );
  }

  await Promise.allSettled(emailJobs);
}

export async function sendPaymentSuccessEmail(context: NotificationContext) {
  const amount = formatCurrencyMAD(context.amount);
  const customerTemplate = customerPaymentConfirmationTemplate({
    customerName: context.customerName,
    bookingId: context.bookingId,
    activityTitle: context.activityTitle,
    amount,
  });

  const emailJobs: Promise<void>[] = [];

  emailJobs.push(
    sendTransactionalEmail({
      to: context.customerEmail,
      ...customerTemplate,
    }).then((customerResult) => {
      trackNotificationFailure("payment_customer", customerResult);
    }),
  );

  if (context.providerEmail) {
    const providerTemplate = providerNewBookingNotificationTemplate({
      customerName: context.customerName,
      bookingId: context.bookingId,
      activityTitle: context.activityTitle,
      amount,
    });

    emailJobs.push(
      sendTransactionalEmail({
        to: context.providerEmail,
        ...providerTemplate,
      }).then((providerResult) => {
        trackNotificationFailure("payment_provider", providerResult);
      }),
    );
  }

  await Promise.allSettled(emailJobs);
}
