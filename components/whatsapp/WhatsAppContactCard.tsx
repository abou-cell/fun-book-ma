import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

export function WhatsAppContactCard({
  phone,
  title,
  message,
  buttonLabel,
}: {
  phone?: string | null;
  title: string;
  message: string;
  buttonLabel: string;
}) {
  if (!phone) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-700">{message}</p>
      <div className="mt-3">
        <WhatsAppButton phone={phone} message={message} label={buttonLabel} />
      </div>
    </div>
  );
}
