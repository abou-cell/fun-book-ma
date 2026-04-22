type ParticipantSelectorProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
};

export function ParticipantSelector({ value, max, onChange }: ParticipantSelectorProps) {
  return (
    <div>
      <label htmlFor="participants" className="text-sm font-medium text-slate-700">
        Participants
      </label>
      <input
        id="participants"
        type="number"
        min={1}
        max={Math.max(1, max)}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-slate-500">Max {Math.max(1, max)} participants for selected slot.</p>
    </div>
  );
}
