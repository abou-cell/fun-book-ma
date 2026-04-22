import { formatDateLabel } from "@/lib/booking/utils";

type AvailabilityCalendarProps = {
  dates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

export function AvailabilityCalendar({ dates, selectedDate, onSelectDate }: AvailabilityCalendarProps) {
  if (dates.length === 0) {
    return <p className="text-sm text-slate-500">No upcoming dates are currently available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {dates.map((date) => {
        const isSelected = selectedDate === date;

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDate(date)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              isSelected
                ? "border-brand bg-brand text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand"
            }`}
          >
            {formatDateLabel(date)}
          </button>
        );
      })}
    </div>
  );
}
