import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ViewId } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { VIEWS } from "./views";

/** Rail lateral de 64px (≥1280px). */
export function Rail({ view }: { view: ViewId }) {
  return (
    <nav aria-label="Views do dashboard" className="hidden w-16 shrink-0 flex-col items-center gap-1 border-r bg-card/40 py-3 xl:flex">
      <span className="bg-gradient-primary mb-3 grid size-9 place-items-center rounded-lg font-display text-base text-primary-foreground" aria-hidden>G</span>
      {VIEWS.map((v) => {
        const on = v.id === view;
        const Icon = v.icon;
        return (
          <Tooltip key={v.id}>
            <TooltipTrigger asChild>
              <Link to="/" search={{ view: v.id }} aria-label={v.label} aria-current={on ? "page" : undefined}
                className={cn("relative grid size-10 place-items-center rounded-lg transition-colors", on ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                {on && <span className="bg-gradient-primary absolute -left-3 top-1.5 h-7 w-1 rounded-r" aria-hidden />}
                <Icon className="size-[18px]" aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{v.label}</TooltipContent>
          </Tooltip>
        );
      })}
      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}

/** Abas inferiores fixas (<1280px). */
export function BottomTabs({ view }: { view: ViewId }) {
  return (
    <nav aria-label="Views do dashboard" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg xl:hidden">
      {VIEWS.map((v) => {
        const on = v.id === view;
        const Icon = v.icon;
        return (
          <Link key={v.id} to="/" search={{ view: v.id }} aria-current={on ? "page" : undefined}
            className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", on ? "text-foreground" : "text-muted-foreground")}>
            {on && <span className="bg-gradient-primary absolute inset-x-6 top-0 h-0.5 rounded-b" aria-hidden />}
            <Icon className="size-[18px]" aria-hidden />
            {v.short}
          </Link>
        );
      })}
    </nav>
  );
}
