import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FilterFieldProps = {
  htmlFor: string;
  label: string;
  children: ReactNode;
};

export function FilterField({ htmlFor, label, children }: FilterFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type FilterInputProps = ComponentPropsWithoutRef<"input">;

export function FilterInput(props: FilterInputProps) {
  return <input {...props} className={inputClassName} />;
}

type FilterSelectProps = ComponentPropsWithoutRef<"select">;

export function FilterSelect(props: FilterSelectProps) {
  return <select {...props} className={inputClassName} />;
}

const inputClassName = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
