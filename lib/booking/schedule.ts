export type ScheduleSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSpots: number;
};

export type ScheduleIndex = {
  dateOrder: string[];
  slotsByDate: Record<string, ScheduleSlot[]>;
};

export function buildScheduleIndex(schedules: ScheduleSlot[]): ScheduleIndex {
  const slotsByDate: Record<string, ScheduleSlot[]> = {};
  const dateOrder: string[] = [];

  for (const slot of schedules) {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
      dateOrder.push(slot.date);
    }

    slotsByDate[slot.date].push(slot);
  }

  return { dateOrder, slotsByDate };
}

export function getPreferredSlot(slots: ScheduleSlot[] | undefined): ScheduleSlot | null {
  if (!slots || slots.length === 0) {
    return null;
  }

  return slots.find((slot) => slot.availableSpots > 0) ?? slots[0] ?? null;
}
