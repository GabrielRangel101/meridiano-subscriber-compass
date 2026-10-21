import { CalendarDays, ShieldCheck } from "lucide-react";
import { AiMode } from "@/components/ai/AiMode";

export function DashboardHeader({ brand, monthLabel }: { brand: string; monthLabel: string }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Subscription Intelligence</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">{brand}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-foreground">
            <ShieldCheck className="size-3.5 text-positive" aria-hidden />
            Dados 100% sintéticos · LGPD
          </span>
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-foreground">
            <CalendarDays className="size-3.5 text-primary" aria-hidden />
            Referência: <strong className="font-semibold">{monthLabel}</strong>
          </span>
        </div>
      </div>
      <AiMode />
    </header>
  );
}
