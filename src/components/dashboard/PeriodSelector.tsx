import { motion } from "framer-motion";
import { PERIOD_OPTIONS } from "@/lib/dashboard-data";
import type { PeriodN } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export function PeriodSelector({ value, onChange }: { value: PeriodN; onChange: (n: PeriodN) => void }) {
  return (
    <div role="radiogroup" aria-label="Período de análise (fluxos, motivos, funil e aquisição)" className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full border bg-card/60 p-0.5">
      {PERIOD_OPTIONS.map((o) => {
        const on = o.n === value;
        return (
          <button key={o.n} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.n)}
            className={cn("relative h-full rounded-full px-3 text-[11px] font-medium transition-colors", on ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {on && <motion.span layoutId="period-pill" className="bg-gradient-primary absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
