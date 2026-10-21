import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { PeriodData } from "@/lib/dashboard-data";
import { NATURE_COLORS } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";

type Reasons = PeriodData["reasons"];

const natureColor = (n: string) => NATURE_COLORS[n] ?? "var(--cat-6)";
/** tom do motivo: mistura a cor da natureza com branco conforme a posição dentro da natureza */
const tone = (base: string, k: number) => (k === 0 ? base : `color-mix(in srgb, ${base} ${Math.max(35, 100 - k * 16)}%, white)`);

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
    <div className="flex flex-col">
      <div
        className="relative mx-auto h-56 w-full max-w-64"
        role="img"
        aria-label={`Donut duplo: ${fmtInt(reasons.total)} cancelamentos. Natureza: ${summary}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={reasons.byNature}
              dataKey="count"
              nameKey="nature"
              innerRadius="42%"
              outerRadius="62%"
              paddingAngle={1.5}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={!reduce}
              onMouseEnter={(d: { nature: string; count: number; share: number }) => setActive({ title: d.nature, count: d.count, share: d.share })}
              onMouseLeave={() => setActive(null)}
            >
              {reasons.byNature.map((n) => (
                <Cell key={n.nature} fill={natureColor(n.nature)} />
              ))}
            </Pie>
            <Pie
              data={outer}
              dataKey="count"
              nameKey="reason"
              innerRadius="66%"
              outerRadius="92%"
              paddingAngle={1}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={!reduce}
              animationBegin={150}
              onMouseEnter={(d: { reason: string; count: number; share: number }) => setActive({ title: d.reason, count: d.count, share: d.share })}
              onMouseLeave={() => setActive(null)}
            >
              {outer.map((r) => (
                <Cell key={`${r.nature}|${r.reason}`} fill={r.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-live="polite">
          <span className="font-display text-2xl font-medium tabular-nums text-foreground">{fmtInt(active ? active.count : reasons.total)}</span>
          <span className="max-w-24 text-[11px] leading-tight text-muted-foreground">
            {active ? `${active.title} · ${fmtPct(active.share, 1)}` : "cancelamentos"}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {reasons.byNature.map((n) => (
          <div key={n.nature}>
            <p className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: natureColor(n.nature) }} aria-hidden />
                {n.nature}
              </span>
              <span className="tabular-nums">
                {fmtPct(n.share, 0)} · {fmtInt(n.count)}
              </span>
            </p>
            <ul className="mt-1 space-y-0.5 pl-4">
              {outer
                .filter((r) => r.nature === n.nature)
                .map((r) => (
                  <li key={r.reason} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-sm" style={{ background: r.fill }} aria-hidden />
                      {r.reason}
                    </span>
                    <span className="tabular-nums">
                      {fmtPct(r.share, 1)} · {fmtInt(r.count)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
