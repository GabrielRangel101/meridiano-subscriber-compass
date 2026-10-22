import { CalendarDays, ShieldCheck } from "lucide-react";
import { InfoTip } from "@/components/dashboard/DashCard";
import type { ViewId } from "@/lib/dashboard-data";
import { NavPill } from "./NavPill";
import { ThemeToggle } from "./ThemeToggle";

const chip = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border bg-card/70 px-3 text-[11px] text-foreground backdrop-blur";

export function TopBar({ brand, monthLabel, view }: { brand: string; monthLabel: string; view: ViewId }) {
  return (
    <header className="relative z-50 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4 xl:h-[72px] xl:flex-nowrap xl:py-0">
      <div className="mr-auto flex min-w-0 flex-col xl:mr-0 xl:flex-1">
        <span className="truncate font-display text-xl font-medium leading-none tracking-tight text-foreground">{brand}</span>
        <span className="mt-1 hidden truncate text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">Subscription Intelligence</span>
      </div>
      <NavPill view={view} className="hidden xl:flex" />
      <ThemeToggle className="xl:hidden" side="bottom" />
      <div className="order-last flex w-full min-w-0 flex-wrap items-center gap-2 xl:order-none xl:w-auto xl:flex-1 xl:flex-nowrap xl:justify-end">
        <span className={chip}>
          <CalendarDays className="size-3.5 text-primary" aria-hidden />
          Ref. <strong className="font-semibold">{monthLabel}</strong>
        </span>
        <span className={chip}>
          <ShieldCheck className="size-3.5 text-positive" aria-hidden />
          LGPD
          <InfoTip label="Sobre os dados" text="Dados sintéticos gerados por simulação determinística (seed fixa), no navegador. Nenhuma informação real de assinantes. Funil: compras reais do dataset; etapas anteriores estimadas por taxas de conversão do canal." />
        </span>
        <ThemeToggle className="hidden size-8 xl:grid" side="bottom" />
      </div>
    </header>
  );
}
