import type { KpiView } from "@/lib/dashboard-data";
import { AnimatedNumber } from "./AnimatedNumber";
import { DeltaBadge } from "./DeltaBadge";
import { Gauge } from "./Gauge";
import { Reveal } from "./Reveal";
import { Sparkline } from "./Sparkline";

export function KpiCard({ kpi, index }: { kpi: KpiView; index: number }) {
  const headingId = `kpi-${kpi.id}`;
  return (
    <Reveal as="article" index={index} className="flex min-w-0 flex-col gap-2 p-4" aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 id={headingId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {kpi.label}
        </h3>
        {kpi.caption && <span className="truncate text-[11px] text-muted-foreground">{kpi.caption}</span>}
      </div>
      <p className="font-display text-3xl font-medium leading-none text-foreground">
        <AnimatedNumber value={kpi.value} format={kpi.format} />
      </p>
      <div className="flex flex-col gap-0.5">
        <DeltaBadge delta={kpi.mom} />
        {kpi.yoy && <DeltaBadge delta={kpi.yoy} subtle />}
      </div>
      <div className="mt-auto pt-1">
        {kpi.kind === "gauge" ? <Gauge value={kpi.value} /> : <Sparkline data={kpi.spark} label={kpi.label} />}
      </div>
    </Reveal>
  );
}
