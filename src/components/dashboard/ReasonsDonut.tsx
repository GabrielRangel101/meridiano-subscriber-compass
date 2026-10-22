import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { WindowData } from "@/lib/dashboard-data";
import { NATURE_COLORS } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";
import { DashCard } from "./DashCard";

type Reasons = WindowData["reasons"];

const natureColor = (n: string) => NATURE_COLORS[n] ?? "var(--cat-6)";
/** tom do motivo: mistura a cor da natureza com o fundo conforme a posição dentro da natureza */
const tone = (base: string, k: number) => (k === 0 ? base : `color-mix(in srgb, ${base} ${Math.max(40, 100 - k * 16)}%, var(--foreground))`);

export function ReasonsCard({ reasons, rangeLabel, className }: { reasons: Reasons; rangeLabel: string; className?: string }) {
  return (
    <DashCard id="reasons-card" ai="reasons" title="Motivos de cancelamento" info={`Natureza (anel interno) e motivo (anel externo) · ${rangeLabel}`} summary={`${fmtInt(reasons.total)} cancel. · últimos 6 meses`} className={className}>
      <ReasonsDonut reasons={reasons} />
    </DashCard>
  );
}

export function ReasonsDonut({ reasons }: { reasons: Reasons }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<{ title: string; count: number; share: number } | null>(null);

  const counters = new Map<string, number>();
  const outer = reasons.rows.map((r) => {
    const k = counters.get(r.nature) ?? 0;
    counters.set(r.nature, k + 1);
    return { ...r, fill: tone(natureColor(r.nature), k) };
  });
  const summary = reasons.byNature.map((n) => `${n.nature} ${fmtPct(n.share, 0)}`).join(", ");

  return (
    <div className="flex min-h-0 flex-1 gap-3">
      <div className="relative aspect-square h-full max-h-full w-[46%] max-w-[46%] shrink-0 self-center" role="img" aria-label={`Donut duplo: ${fmtInt(reasons.total)} cancelamentos. Natureza: ${summary}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={reasons.byNature} dataKey="count" nameKey="nature" innerRadius="44%" outerRadius="64%" paddingAngle={1.5} stroke="var(--card)" strokeWidth={2} isAnimationActive={!reduce}
              onMouseEnter={(d: { nature: string; count: number; share: number }) => setActive({ title: d.nature, count: d.count, share: d.share })}
              onMouseLeave={() => setActive(null)}>
              {reasons.byNature.map((n) => <Cell key={n.nature} fill={natureColor(n.nature)} />)}
            </Pie>
            <Pie data={outer} dataKey="count" nameKey="reason" innerRadius="68%" outerRadius="96%" paddingAngle={1} stroke="var(--card)" strokeWidth={2} isAnimationActive={!reduce} animationBegin={150}
              onMouseEnter={(d: { reason: string; count: number; share: number }) => setActive({ title: d.reason, count: d.count, share: d.share })}
              onMouseLeave={() => setActive(null)}>
              {outer.map((r) => <Cell key={`${r.nature}|${r.reason}`} fill={r.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-live="polite">
          <span className="text-base font-semibold tabular-nums text-foreground">{fmtInt(active ? active.count : reasons.total)}</span>
          <span className="max-w-[60%] truncate text-[10px] leading-tight text-muted-foreground">{active ? fmtPct(active.share, 1) : "total"}</span>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {active && <p className="truncate text-[11px] font-semibold text-foreground">{active.title}</p>}
        {reasons.byNature.map((n) => (
          <div key={n.nature}>
            <p className="flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground">
              <span className="flex min-w-0 items-center gap-1.5"><span className="size-2 shrink-0 rounded-full" style={{ background: natureColor(n.nature) }} aria-hidden /><span className="truncate">{n.nature}</span></span>
              <span className="shrink-0 tabular-nums">{fmtPct(n.share, 0)}</span>
            </p>
            <ul className="pl-3.5">
              {outer.filter((r) => r.nature === n.nature).map((r) => (
                <li key={r.reason} className="flex items-center justify-between gap-2 text-[11px] leading-5 text-muted-foreground" title={`${r.reason}: ${fmtInt(r.count)} (${fmtPct(r.share, 1)})`}>
                  <span className="flex min-w-0 items-center gap-1.5"><span className="size-1.5 shrink-0 rounded-sm" style={{ background: r.fill }} aria-hidden /><span className="truncate">{r.reason}</span></span>
                  <span className="shrink-0 tabular-nums">{fmtPct(r.share, 1)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
