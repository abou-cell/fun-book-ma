type TemplateInput = {
  customerName: string;
  bookingId: string;
  activityTitle: string;
  amount: string;
};

export function customerBookingConfirmationTemplate(input: TemplateInput) {
  return {
    subject: `Booking received for ${input.activityTitle}`,
    html: `<p>Hi ${input.customerName},</p><p>Your booking (${input.bookingId}) for <strong>${input.activityTitle}</strong> has been created.</p><p>Total: ${input.amount}</p>`,
    text: `Hi ${input.customerName}, your booking (${input.bookingId}) for ${input.activityTitle} has been created. Total: ${input.amount}`,
  };
}

export function customerPaymentConfirmationTemplate(input: TemplateInput) {
  return {
    subject: `Payment confirmed for ${input.activityTitle}`,
    html: `<p>Hi ${input.customerName},</p><p>Your payment for booking <strong>${input.bookingId}</strong> is confirmed.</p><p>Paid: ${input.amount}</p>`,
    text: `Hi ${input.customerName}, your payment for booking ${input.bookingId} is confirmed. Paid: ${input.amount}`,
  };
}

export function providerNewBookingNotificationTemplate(input: TemplateInput) {
  return {
    subject: `New booking: ${input.activityTitle}`,
    html: `<p>You have a new booking <strong>${input.bookingId}</strong> for ${input.activityTitle}.</p><p>Amount: ${input.amount}</p>`,
    text: `New booking ${input.bookingId} for ${input.activityTitle}. Amount: ${input.amount}`,
  };
}
