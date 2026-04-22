type BookingFormProps = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  onChange: (field: "customerName" | "customerEmail" | "customerPhone" | "notes", value: string) => void;
};

export function BookingForm({ customerName, customerEmail, customerPhone, notes, onChange }: BookingFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full name"
        value={customerName}
        onChange={(event) => onChange("customerName", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={customerEmail}
        onChange={(event) => onChange("customerEmail", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
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
