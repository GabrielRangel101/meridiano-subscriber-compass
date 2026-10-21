import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel } from "@/engine/calendar";
import type { MonthPoint } from "@/engine/metrics";
import type { EventMarker } from "@/engine/types";
import { fmtInt, fmtPct, fmtSignedInt } from "@/lib/format";
import { GlassTooltip } from "./ChartTooltip";
import { EventLegend, EventPopover, eventMarkers } from "./EventMarkers";
import { Reveal } from "./Reveal";

export function FlowBars({ series, events, index }: { series: MonthPoint[]; events: EventMarker[]; index: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<{ e: EventMarker | null; x: number }>({ e: null, x: 0 });
  // apenas apresentação: cancelamentos desenhados para baixo
  const rows = useMemo(() => series.map((p) => ({ ...p, cancelledDown: -p.cancelled })), [series]);

  return (
    <Reveal index={index} className="lg:col-span-12" aria-labelledby="flow-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="flow-title" className="font-display text-xl font-medium text-foreground">
            Novas assinaturas × cancelamentos
          </h2>
          <p className="text-sm text-muted-foreground">24 meses · barras divergentes e saldo líquido</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm bg-positive" aria-hidden />▲ Novas</span>
          <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm bg-danger" aria-hidden />▼ Cancelamentos</span>
          <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-accent" aria-hidden />● Saldo</span>
          <EventLegend />
        </div>
      </div>

      <div
        className="relative mt-4 h-72 sm:h-80"
        role="img"
        aria-label={`Gráfico de barras divergentes de ${series[0].label} a ${series[series.length - 1].label}: novas assinaturas acima de zero, cancelamentos abaixo e linha de saldo líquido.`}
      >
        <EventPopover event={hover.e} x={hover.x} />
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} stackOffset="sign" margin={{ top: 24, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => fmtInt(Math.abs(v))}
            />
            <ReferenceLine y={0} stroke="var(--foreground)" strokeOpacity={0.55} strokeWidth={1.25} />
            {eventMarkers(events, monthLabel, (e, x) => setHover({ e, x: x ?? 0 }))}
            <Tooltip
              cursor={{ fill: "var(--primary)", fillOpacity: 0.05 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as MonthPoint;
                return (
                  <GlassTooltip
                    title={String(label)}
                    rows={[
                      { label: "Novas", value: fmtInt(p.newSubs), color: "var(--positive-fill)" },
                      { label: "Cancelamentos", value: fmtInt(p.cancelled), color: "var(--danger)" },
                      { label: "Saldo", value: fmtSignedInt(p.netAdds), color: "var(--accent)" },
                      { label: "Churn do mês", value: fmtPct(p.churnRate, 1) },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="newSubs" stackId="flow" fill="var(--positive-fill)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={!reduce} />
            <Bar dataKey="cancelledDown" stackId="flow" fill="var(--danger)" fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={!reduce} />
            <Line
              type="monotone"
              dataKey="netAdds"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive={!reduce}
              animationBegin={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Reveal>
  );
}
