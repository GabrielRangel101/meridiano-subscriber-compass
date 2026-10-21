import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CompositionRow } from "@/engine/metrics";
import { PLAN_COLORS } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function WaffleCard({
  comp,
  waffle,
  monthLabel,
  index,
}: {
  comp: CompositionRow[];
  waffle: { key: string; cells: number }[];
  monthLabel: string;
  index: number;
}) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);
  const cells = useMemo(() => waffle.flatMap((w) => Array.from({ length: w.cells }, () => w.key)), [waffle]);
  const summary = comp.map((c) => `${c.key} ${fmtPct(c.share, 0)}`).join(", ");

  return (
    <Reveal index={index} className="flex flex-col lg:col-span-4" aria-labelledby="waffle-title">
      <h2 id="waffle-title" className="font-display text-xl font-medium text-foreground">
        Composição por plano
      </h2>
      <p className="text-sm text-muted-foreground">Base ativa em {monthLabel} · cada quadrado = 1%</p>

      <div
        className="mx-auto mt-4 grid w-full max-w-72 grid-cols-10 gap-1"
        role="img"
        aria-label={`Gráfico waffle de 100 células: ${summary}.`}
      >
        {cells.map((key, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[4px] transition-opacity duration-200"
            style={{ background: PLAN_COLORS[key] ?? "var(--cat-6)", opacity: focus && focus !== key ? 0.15 : 1 }}
            initial={reduce ? false : { scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: focus && focus !== key ? 0.15 : 1 }}
            transition={{ delay: reduce ? 0 : 0.2 + i * 0.006, duration: 0.25 }}
            aria-hidden
          />
        ))}
      </div>

      <ul className="mt-5 space-y-1">
        {comp.map((c) => (
          <li key={c.key}>
            <button
              type="button"
              onMouseEnter={() => setFocus(c.key)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(c.key)}
              onBlur={() => setFocus(null)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                focus === c.key && "bg-secondary",
              )}
            >
              <span className="flex items-center gap-2 text-foreground">
                <span className="size-3 rounded-[3px]" style={{ background: PLAN_COLORS[c.key] ?? "var(--cat-6)" }} aria-hidden />
                {c.key}
              </span>
              <span className="tabular-nums text-muted-foreground">
                <strong className="font-semibold text-foreground">{fmtPct(c.share, 1)}</strong> · {fmtInt(c.count)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
