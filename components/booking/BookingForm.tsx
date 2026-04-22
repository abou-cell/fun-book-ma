import { memo } from "react";

type BookingFormProps = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  onChange: (field: "customerName" | "customerEmail" | "customerPhone" | "notes", value: string) => void;
};

function BookingFormComponent({ customerName, customerEmail, customerPhone, notes, onChange }: BookingFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full name"
        autoComplete="name"
        minLength={2}
        required
        value={customerName}
        onChange={(event) => onChange("customerName", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        inputMode="email"
        required
        value={customerEmail}
        onChange={(event) => onChange("customerEmail", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        autoComplete="tel"
        inputMode="tel"
        value={customerPhone}
        onChange={(event) => onChange("customerPhone", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(event) => onChange("notes", event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

export const BookingForm = memo(BookingFormComponent);
