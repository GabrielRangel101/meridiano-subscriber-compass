import type { AiTargetId, KpiView } from "@/lib/dashboard-data";
import { useAiTarget } from "@/components/ai/ai-store";
import { AnimatedNumber } from "./AnimatedNumber";
import { AskButton, InfoTip } from "./DashCard";
import { DeltaBadge } from "./DeltaBadge";
import { Gauge } from "./Gauge";
import { Sparkline } from "./Sparkline";

export function KpiCard({ kpi }: { kpi: KpiView }) {
  const headingId = `kpi-${kpi.id}`;
  const ai = `kpi-${kpi.id}` as AiTargetId;
  const target = useAiTarget(ai);
  return (
    <article {...target.props} className="dash-card grid h-28 min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-2 p-3 2xl:grid-cols-[minmax(0,1fr)_4.5rem]" aria-labelledby={headingId}>
      <div className="flex min-w-0 flex-col">
        <div className="flex min-w-0 items-center gap-1">
          <h3 id={headingId} className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {kpi.label}
          </h3>
          {kpi.caption && <InfoTip text={kpi.caption} label={`Sobre: ${kpi.label}`} />}
        </div>
        <p className="mt-1.5 truncate text-[1.5rem] font-semibold 2xl:text-[1.875rem] leading-none tracking-tight text-foreground">
          <AnimatedNumber value={kpi.value} format={kpi.format} />
        </p>
        <div className="mt-auto flex min-w-0 flex-col text-[0.6875rem] [&>span]:truncate">
          <DeltaBadge delta={kpi.mom} />
          {kpi.yoy && <DeltaBadge delta={kpi.yoy} subtle />}
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-end justify-between">
        <AskButton title={kpi.label} ai={ai} />
        <div className={kpi.kind === "gauge" ? "h-12 w-[4.5rem]" : "hidden h-12 w-[4.5rem] 2xl:block"}>
          {kpi.kind === "gauge" ? <Gauge value={kpi.value} /> : <Sparkline data={kpi.spark} label={kpi.label} />}
        </div>
      </div>
    </article>
  );
}
