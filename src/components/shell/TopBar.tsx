import { CalendarDays, Search, ShieldCheck, Sparkles } from "lucide-react";
import { aiStore, useAi } from "@/components/ai/ai-store";
import { InfoTip } from "@/components/dashboard/DashCard";
import type { ViewId } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { commandStore } from "./command-store";
import { NavTabs } from "./NavTabs";
import { ThemeToggle } from "./ThemeToggle";

function LinkedinMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const chip = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border bg-card px-3 text-[0.6875rem] text-foreground";

export function TopBar({ brand, monthLabel, view }: { brand: string; monthLabel: string; view: ViewId }) {
  const { active } = useAi();
  return (
    <header className="relative z-50 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-3 py-2 sm:px-4 xl:h-[4.25rem] xl:flex-nowrap xl:py-0">
      <div className="mr-auto flex min-w-0 items-center gap-3 xl:mr-0 xl:flex-1">
        <img src="/logo.svg" alt="" width={36} height={36} className="size-9 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-display text-2xl font-semibold leading-none tracking-tight text-foreground">{brand}</span>
          <span className="mt-1 hidden truncate text-[0.625rem] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">Subscription Intelligence · Edição {monthLabel}</span>
        </div>
      </div>
      <NavTabs view={view} className="hidden shrink-0 xl:flex" />
      <ThemeToggle className="xl:hidden" side="bottom" />
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:order-last sm:w-full xl:order-none xl:w-auto xl:flex-1 xl:flex-nowrap xl:justify-end">
        <span className={cn(chip, "hidden min-[1800px]:inline-flex")}>
          <CalendarDays className="size-3.5 text-primary" aria-hidden />
          Ref. <strong className="font-semibold">{monthLabel}</strong>
        </span>
        <a href="https://www.linkedin.com/in/gabriel-rangel-a954ba26a/" target="_blank" rel="noreferrer" title="Gabriel Rangel · autor do projeto (LinkedIn)" aria-label="Gabriel Rangel, autor do projeto, no LinkedIn" className={cn(chip, "hidden px-2 text-muted-foreground hover:text-foreground sm:inline-flex min-[1800px]:px-3")}>
          <LinkedinMark />
          <span className="hidden min-[1800px]:inline">por <strong className="font-semibold text-foreground">Gabriel Rangel</strong></span>
        </a>
        <span className={chip}>
          <ShieldCheck className="size-3.5 text-positive" aria-hidden />
          LGPD
          <InfoTip label="Sobre os dados" text="Dados sintéticos gerados por simulação determinística (seed fixa), no navegador. Nenhuma informação real de assinantes. Funil: compras reais do dataset; etapas anteriores estimadas por taxas de conversão do canal." />
        </span>
        <button type="button" onClick={() => commandStore.toggle()} aria-label="Abrir barra de comandos" className={cn(chip, "hidden gap-2 text-muted-foreground hover:text-foreground sm:inline-flex")}>
          <Search className="size-3.5" aria-hidden />
          <span className="hidden min-[1800px]:inline">Buscar</span>
          <kbd className="hidden rounded border px-1 text-[0.625rem] min-[1800px]:inline">Ctrl K</kbd>
        </button>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => aiStore.toggle()}
          className={cn("hidden h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors xl:inline-flex", active ? "bg-foreground text-background" : "bg-brand text-brand-foreground hover:opacity-90")}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Mesa de análise
        </button>
        <ThemeToggle className="hidden size-8 xl:grid" side="bottom" />
      </div>
    </header>
  );
}
