"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ParticipantSelector } from "@/components/booking/ParticipantSelector";
import { TimeSlotList, type TimeSlotItem } from "@/components/booking/TimeSlotList";
import { buildScheduleIndex, getPreferredSlot } from "@/lib/booking/schedule";

export type BookingSchedule = TimeSlotItem & {
  date: string;
};

type BookingSectionProps = {
  activityId: string;
  schedules: BookingSchedule[];
  defaultCustomerName?: string;
  defaultCustomerEmail?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingSection({
  activityId,
  schedules,
  defaultCustomerName = "",
  defaultCustomerEmail = "",
}: BookingSectionProps) {
  const router = useRouter();

  const scheduleIndex = useMemo(() => buildScheduleIndex(schedules), [schedules]);
  const [selectedDate, setSelectedDate] = useState<string | null>(scheduleIndex.dateOrder[0] ?? null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const resolvedDate = selectedDate && scheduleIndex.slotsByDate[selectedDate] ? selectedDate : scheduleIndex.dateOrder[0] ?? null;
  const daySlots = useMemo(
    () => (resolvedDate ? scheduleIndex.slotsByDate[resolvedDate] ?? [] : []),
    [resolvedDate, scheduleIndex.slotsByDate],
  );

  const selectedSlot = useMemo(() => {
    const explicitSlot = daySlots.find((slot) => slot.id === selectedSlotId);
    if (explicitSlot) {
      return explicitSlot;
    }

    return getPreferredSlot(daySlots);
  }, [daySlots, selectedSlotId]);

  const [participants, setParticipants] = useState(1);
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxParticipants = Math.max(1, selectedSlot?.availableSpots ?? 1);
  const participantCount = Math.min(participants, maxParticipants);

  const handleDateChange = useCallback(
    (date: string) => {
      if (date === resolvedDate) {
        return;
      }

      setSelectedDate(date);
      const nextSlot = getPreferredSlot(scheduleIndex.slotsByDate[date]);
      setSelectedSlotId(nextSlot?.id ?? null);
      setParticipants(1);
      setError(null);
    },
    [resolvedDate, scheduleIndex.slotsByDate],
  );

  const handleParticipantsChange = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) {
        setParticipants(1);
        return;
      }

      setParticipants(Math.max(1, Math.min(maxParticipants, Math.round(value))));
    },
    [maxParticipants],
  );

  const submitBooking = useCallback(async () => {
    setError(null);

    if (!selectedSlot || selectedSlot.availableSpots <= 0) {
      setError("Please select an available time slot.");
      return;
    }

    if (participantCount < 1 || participantCount > selectedSlot.availableSpots) {
      setError("Invalid participant count for this slot.");
      return;
    }

    if (!customerName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!emailRegex.test(customerEmail.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          scheduleId: selectedSlot.id,
          participants: participantCount,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim(),
        }),
      });

      const payload = (await response.json()) as { error?: string; bookingId?: string };

      if (!response.ok || !payload.bookingId) {
        setError(payload.error ?? "Booking failed. Please try again.");
        return;
      }

      router.push(`/booking/confirmation/${payload.bookingId}`);
      router.refresh();
    } catch {
      setError("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activityId, customerEmail, customerName, customerPhone, notes, participantCount, router, selectedSlot]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Book this activity</h3>

      <AvailabilityCalendar dates={scheduleIndex.dateOrder} selectedDate={resolvedDate} onSelectDate={handleDateChange} />

      <TimeSlotList slots={daySlots} selectedSlotId={selectedSlot?.id ?? null} onSelectSlot={setSelectedSlotId} />

      <ParticipantSelector value={participantCount} max={maxParticipants} onChange={handleParticipantsChange} />

      <BookingSummary participants={participantCount} unitPrice={selectedSlot?.price ?? 0} />

      <BookingForm
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        notes={notes}
        onChange={(field, value) => {
          if (field === "customerName") setCustomerName(value);
          if (field === "customerEmail") setCustomerEmail(value);
          if (field === "customerPhone") setCustomerPhone(value);
          if (field === "notes") setNotes(value);
        }}
      />

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <button
        type="button"
        disabled={isSubmitting || !selectedSlot || selectedSlot.availableSpots <= 0}
        onClick={submitBooking}
        className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? "Creating booking..." : "Confirm booking"}
      </button>
    </div>
  );
}
