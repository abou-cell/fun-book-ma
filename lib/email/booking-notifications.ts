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

export async function sendBookingCreatedEmails(context: NotificationContext) {
  const amount = formatCurrencyMAD(context.amount);
  const customerTemplate = customerBookingConfirmationTemplate({
    customerName: context.customerName,
    bookingId: context.bookingId,
    activityTitle: context.activityTitle,
    amount,
  });

  await sendTransactionalEmail({
    to: context.customerEmail,
    ...customerTemplate,
  });

  if (context.providerEmail) {
    const providerTemplate = providerNewBookingNotificationTemplate({
      customerName: context.customerName,
      bookingId: context.bookingId,
      activityTitle: context.activityTitle,
      amount,
    });

    await sendTransactionalEmail({
      to: context.providerEmail,
      ...providerTemplate,
    });
  }
}

export async function sendPaymentSuccessEmail(context: NotificationContext) {
  const amount = formatCurrencyMAD(context.amount);
  const customerTemplate = customerPaymentConfirmationTemplate({
    customerName: context.customerName,
    bookingId: context.bookingId,
    activityTitle: context.activityTitle,
    amount,
  });

  await sendTransactionalEmail({
    to: context.customerEmail,
    ...customerTemplate,
  });
}
