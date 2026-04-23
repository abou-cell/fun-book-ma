"use client";

import { PaymentMethod } from "@prisma/client";

type Option = { value: PaymentMethod; label: string; description: string; disabled?: boolean };

export function PaymentMethodSelector({
  value,
  onChange,
  options,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  options: Option[];
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="block rounded-xl border border-slate-200 p-3 text-sm">
          <div className="flex items-start gap-2">
            <input
              type="radio"
              name="paymentMethod"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1"
              disabled={option.disabled}
            />
            <div>
              <p className="font-medium text-slate-900">{option.label}</p>
              <p className="text-slate-600">{option.description}</p>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
