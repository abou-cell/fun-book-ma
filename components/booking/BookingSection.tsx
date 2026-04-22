"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ParticipantSelector } from "@/components/booking/ParticipantSelector";
import { TimeSlotList, type TimeSlotItem } from "@/components/booking/TimeSlotList";

export type BookingSchedule = TimeSlotItem & {
  date: string;
};

type BookingSectionProps = {
  activityId: string;
  schedules: BookingSchedule[];
  defaultCustomerName?: string;
  defaultCustomerEmail?: string;
};

export function BookingSection({
  activityId,
  schedules,
  defaultCustomerName = "",
  defaultCustomerEmail = "",
}: BookingSectionProps) {
  const router = useRouter();
  const uniqueDates = useMemo(() => Array.from(new Set(schedules.map((slot) => slot.date))), [schedules]);
  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates[0] ?? null);
  const daySlots = useMemo(() => schedules.filter((slot) => slot.date === selectedDate), [schedules, selectedDate]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(daySlots[0]?.id ?? null);
  const selectedSlot = daySlots.find((slot) => slot.id === selectedSlotId) ?? null;

  const [participants, setParticipants] = useState(1);
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDateChange(date: string) {
    setSelectedDate(date);
    const nextSlot = schedules.find((slot) => slot.date === date && slot.availableSpots > 0) ?? schedules.find((slot) => slot.date === date) ?? null;
    setSelectedSlotId(nextSlot?.id ?? null);
    setParticipants(1);
    setError(null);
  }

  function handleParticipantsChange(value: number) {
    const max = selectedSlot?.availableSpots ?? 1;
    if (!Number.isFinite(value)) {
      setParticipants(1);
      return;
    }

    setParticipants(Math.max(1, Math.min(max, Math.round(value))));
  }

  async function submitBooking() {
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    if (participants < 1 || participants > selectedSlot.availableSpots) {
      setError("Invalid participant count for this slot.");
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Please provide your name and email.");
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
          participants,
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
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Book this activity</h3>

      <AvailabilityCalendar dates={uniqueDates} selectedDate={selectedDate} onSelectDate={handleDateChange} />

      <TimeSlotList slots={daySlots} selectedSlotId={selectedSlotId} onSelectSlot={setSelectedSlotId} />

      <ParticipantSelector value={participants} max={selectedSlot?.availableSpots ?? 1} onChange={handleParticipantsChange} />

      <BookingSummary participants={participants} unitPrice={selectedSlot?.price ?? 0} />

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
