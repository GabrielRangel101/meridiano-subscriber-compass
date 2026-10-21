import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthLabel } from "@/engine/calendar";
import type { EventMarker } from "@/engine/types";
import type { DashboardData } from "@/lib/dashboard-data";
import { fmtCompact, fmtInt, fmtSignedInt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { GlassTooltip } from "./ChartTooltip";
import { EventLegend, EventPopover, eventMarkers } from "./EventMarkers";
import { Reveal } from "./Reveal";

interface Row {
  label: string;
  active?: number;
  projection?: number;
}

export function EvolutionChart({ data, index }: { data: DashboardData; index: number }) {
  const { series, proj, ds, current, goalLabel } = data;
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<{ e: EventMarker | null; x: number }>({ e: null, x: 0 });

  const rows = useMemo<Row[]>(() => {
    const hist: Row[] = series.map((p) => ({ label: p.label, active: p.active }));
    hist[hist.length - 1].projection = current.active; // projeção parte do último ponto real
    return [...hist, ...proj.points.map((p) => ({ label: p.label, projection: p.value }))];
  }, [series, proj, current]);

  const goal = ds.meta.goalActive;

  return (
    <Reveal index={index} className="lg:col-span-8" aria-labelledby="evo-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="evo-title" className="font-display text-xl font-medium text-foreground">
            Evolução de assinantes
          </h2>
          <p className="text-sm text-muted-foreground">Base ativa mensal e projeção linear até {goalLabel}</p>
        </div>
        <EventLegend />
      </div>

      <div className="relative mt-4 h-72 sm:h-80" role="img" aria-label={`Gráfico de linha: assinantes ativos de ${series[0].label} a ${current.label}, com projeção até ${goalLabel} e meta de ${fmtInt(goal)}.`}>
        <EventPopover event={hover.e} x={hover.x} />
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 24, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="evo-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={fmtCompact}
              domain={[(min: number) => Math.floor((min * 0.95) / 500) * 500, (max: number) => Math.max(max, goal) * 1.02]}
            />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const r = payload[0].payload as Row;
                return (
                  <GlassTooltip
                    title={String(label)}
                    rows={[
                      ...(r.active !== undefined ? [{ label: "Ativos", value: fmtInt(r.active), color: "var(--primary)" }] : []),
                      ...(r.active === undefined && r.projection !== undefined
                        ? [{ label: "Projeção", value: fmtInt(r.projection), color: "var(--primary-glow)" }]
                        : []),
                      { label: "Meta", value: fmtInt(goal), color: "var(--accent)" },
                    ]}
                  />
                );
              }}
            />
            <ReferenceLine
              y={goal}
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{ value: `Meta ${fmtInt(goal)} · ${goalLabel}`, position: "insideTopLeft", fill: "var(--warning)", fontSize: 11, fontWeight: 600 }}
            />
            <ReferenceLine
              x={current.label}
              stroke="var(--foreground)"
              strokeOpacity={0.5}
              label={{ value: "HOJE", position: "insideTopRight", fill: "var(--foreground)", fontSize: 10, fontWeight: 600 }}
            />
            {eventMarkers(ds.meta.events, monthLabel, (e, x) => setHover({ e, x: x ?? 0 }))}
            <Area
              type="monotone"
              dataKey="active"
              stroke="var(--primary)"
              strokeWidth={2.25}
              fill="url(#evo-fill)"
              isAnimationActive={!reduce}
              animationDuration={900}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="projection"
              stroke="var(--primary-glow)"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              isAnimationActive={!reduce}
              animationBegin={700}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat label={`Projeção em ${goalLabel}`} value={fmtInt(proj.projectedAtGoal)} />
        <MiniStat
          label="Falta para a meta"
          value={proj.gap > 0 ? fmtInt(proj.gap) : "Meta superada"}
          badge={
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                proj.onTrack ? "bg-positive/10 text-positive" : "bg-danger/10 text-danger",
              )}
            >
              {proj.onTrack ? "✓ No caminho" : "↓ Abaixo da meta"}
            </span>
          }
        />
        <MiniStat
          label="Saldo líquido necessário/mês"
          value={fmtSignedInt(proj.requiredNetAdds)}
          hint={`atual: ${fmtSignedInt(proj.currentNetAdds)}/mês`}
        />
      </dl>
    </Reveal>
  );
}

function MiniStat({ label, value, hint, badge }: { label: string; value: string; hint?: string; badge?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background/50 px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="font-display text-2xl font-medium tabular-nums text-foreground">{value}</span>
        {badge}
        {hint && <span className="text-xs tabular-nums text-muted-foreground">{hint}</span>}
      </dd>
    </div>
  );
}
