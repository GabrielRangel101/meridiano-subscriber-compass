import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex self-start rounded-full sm:self-auto">
            <button
              type="button"
              disabled
              aria-disabled
              className="bg-gradient-primary inline-flex cursor-not-allowed items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground opacity-80 shadow-lg"
            >
              <Sparkles className="size-4" aria-hidden />
              Modo IA
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>em breve</TooltipContent>
      </Tooltip>
    </header>
  );
}
