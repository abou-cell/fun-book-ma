import { BookingStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AggregateRatingInput = {
  rating: number;
  reviewCount: number;
};

const MIN_TRUSTED_REVIEW_COUNT = 1;

export function getTrustedAggregateRating({ rating, reviewCount }: AggregateRatingInput) {
  if (!Number.isFinite(rating) || !Number.isInteger(reviewCount)) {
    return null;
  }

  if (reviewCount < MIN_TRUSTED_REVIEW_COUNT || rating < 1 || rating > 5) {
    return null;
  }

  return {
    rating,
    reviewCount,
  };
}

type ReviewOwnershipValidationInput = {
  userId: string;
  activityId: string;
};

export async function validateReviewOwnership({ userId, activityId }: ReviewOwnershipValidationInput) {
  const eligibleBooking = await prisma.booking.findFirst({
    where: {
      userId,
      activityId,
      status: BookingStatus.CONFIRMED,
      paymentStatus: {
        in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED],
      },
    },
    select: {
      id: true,
    },
  });

  return {
    canReview: Boolean(eligibleBooking),
    bookingId: eligibleBooking?.id,
  };
}
