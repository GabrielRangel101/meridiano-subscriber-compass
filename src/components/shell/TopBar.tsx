import { CalendarDays, ShieldCheck } from "lucide-react";
import { AiMode } from "@/components/ai/AiMode";
import { InfoTip } from "@/components/dashboard/DashCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import type { PeriodN } from "@/lib/dashboard-data";
import { ThemeToggle } from "./ThemeToggle";

const chip = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border bg-card/60 px-3 text-[11px] text-foreground";

export function TopBar({ brand, monthLabel, period, onPeriod }: { brand: string; monthLabel: string; period: PeriodN; onPeriod: (n: PeriodN) => void }) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:px-4 xl:h-14 xl:flex-nowrap xl:py-0">
      <div className="mr-auto flex min-w-0 items-baseline gap-2">
        <span className="truncate font-display text-xl font-medium leading-none tracking-tight text-foreground">{brand}</span>
        <span className="hidden truncate text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline">Subscription Intelligence</span>
      </div>
      <ThemeToggle className="xl:hidden" side="bottom" />
      <AiMode />
      <div className="order-last flex w-full min-w-0 flex-wrap items-center gap-2 xl:order-none xl:w-auto xl:flex-nowrap">
        <PeriodSelector value={period} onChange={onPeriod} />
        <span className={chip}>
          <CalendarDays className="size-3.5 text-primary" aria-hidden />
          Ref. <strong className="font-semibold">{monthLabel}</strong>
        </span>
        <span className={chip}>
          <ShieldCheck className="size-3.5 text-positive" aria-hidden />
          Dados sintéticos · LGPD
          <InfoTip label="Sobre os dados" text="Dados sintéticos gerados por simulação determinística (seed fixa), no navegador. Nenhuma informação real de assinantes. Funil: compras reais do dataset; etapas anteriores estimadas por taxas de conversão do canal." />
        </span>
      </div>
    </header>
  );
}
