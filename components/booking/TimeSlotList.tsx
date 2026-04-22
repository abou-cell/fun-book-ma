import { formatTimeLabel } from "@/lib/booking/utils";

export type TimeSlotItem = {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSpots: number;
};

type TimeSlotListProps = {
  slots: TimeSlotItem[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
};

export function TimeSlotList({ slots, selectedSlotId, onSelectSlot }: TimeSlotListProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-slate-500">No time slots available for this date.</p>;
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const full = slot.availableSpots <= 0;
        const selected = slot.id === selectedSlotId;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={full}
            onClick={() => onSelectSlot(slot.id)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
              full
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : selected
                  ? "border-brand bg-brand/10"
                  : "border-slate-300 bg-white hover:border-brand"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
              </span>
              <span className="text-xs">{full ? "Full" : `${slot.availableSpots} spots left`}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
