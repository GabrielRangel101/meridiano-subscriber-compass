import { useState } from "react";
import type { AtRiskRow } from "@/engine/metrics";
import type { DashboardData, WindowData } from "@/lib/dashboard-data";
import { CHANNEL_COLORS, PLAN_COLORS } from "@/lib/dashboard-data";
import { AtRiskNow } from "@/components/dashboard/AtRiskNow";
import { FunnelCard } from "@/components/dashboard/ChannelFunnel";
import { CohortRetention } from "@/components/dashboard/CohortRetention";
import { CorrelationNetwork } from "@/components/dashboard/CorrelationNetwork";
import { BaseBridge } from "@/components/dashboard/BaseBridge";
import { EditoriaHealth } from "@/components/dashboard/EditoriaHealth";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { FlowBars } from "@/components/dashboard/FlowBars";
import { InsightsCompact } from "@/components/dashboard/InsightsCompact";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MonthlyChanges } from "@/components/dashboard/MonthlyChanges";
import { ReasonsCard } from "@/components/dashboard/ReasonsDonut";
import { RiskMap, RiskPanel } from "@/components/dashboard/RiskMap";
import { RuleInsights } from "@/components/dashboard/RuleInsights";
import { VolumeQuality } from "@/components/dashboard/VolumeQuality";
import { WaffleCard } from "@/components/dashboard/WaffleCard";

interface ViewProps {
  data: DashboardData;
  period: WindowData;
}

const GRID = "grid grid-cols-1 gap-3 md:grid-cols-2 xl:h-full xl:grid-cols-12";

export function OverviewView({ data, period }: ViewProps) {
  return (
    <div className={`${GRID} xl:grid-rows-[112px_minmax(0,1.15fr)_minmax(0,1fr)]`}>
      <section id="kpi-section" aria-label="Indicadores principais" className="grid grid-cols-1 gap-3 rounded-[14px] sm:grid-cols-2 md:col-span-2 lg:grid-cols-3 xl:col-span-12 xl:grid-cols-5">
        {data.kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </section>
      <EvolutionChart data={data} className="h-[380px] md:col-span-2 xl:col-span-6 xl:h-auto" />
      <WaffleCard ai="waffle-plans" title="Planos" info={`Base ativa em ${data.current.label} por plano · cada quadrado = 1%`} comp={data.comp} waffle={data.waffle} colors={PLAN_COLORS} className="h-[340px] xl:col-span-3 xl:h-auto" />
      <InsightsCompact data={data} className="h-[240px] xl:col-span-3 xl:h-auto" />
      <FlowBars series={data.series} events={data.ds.meta.events} className="h-[300px] md:col-span-2 xl:col-span-5 xl:h-auto" />
      <ReasonsCard reasons={period.reasons} rangeLabel={period.rangeLabel} className="h-[280px] xl:col-span-3 xl:h-auto" />
      <AtRiskNow data={data} className="h-[320px] xl:col-span-4 xl:h-auto" />
    </div>
  );
}

export function AcquisitionView({ data, period }: ViewProps) {
  return (
    <div className={`${GRID} xl:grid-rows-[minmax(0,1fr)_auto]`}>
      <VolumeQuality rows={period.quality} className="h-[400px] md:col-span-2 xl:col-span-8 xl:h-auto" />
      <WaffleCard ai="waffle-channels" title="Canais" info={`Base ativa em ${data.current.label} por canal de aquisição · cada quadrado = 1%`} comp={data.channelComp} waffle={data.channelWaffle} colors={CHANNEL_COLORS} className="h-[380px] md:col-span-2 xl:col-span-4 xl:h-auto" />
      <FunnelCard rows={period.funnel} best={period.bestChannel} worst={period.worstChannel} rangeLabel={period.rangeLabel} className="md:col-span-2 xl:col-span-12" />
    </div>
  );
}

export function RetentionView({ data, period }: ViewProps) {
  return (
    <div className={`${GRID} xl:grid-rows-2`}>
      <CohortRetention data={data} className="h-[360px] md:col-span-2 xl:col-span-6 xl:h-auto" />
      <EditoriaHealth data={data} className="h-[320px] xl:col-span-3 xl:h-auto" />
      <MonthlyChanges changes={data.changes} className="h-[340px] xl:col-span-3 xl:h-auto" />
      <BaseBridge bridge={period.bridge} className="h-[340px] md:col-span-2 xl:col-span-8 xl:h-auto" />
      <ReasonsCard reasons={period.reasons} rangeLabel={period.rangeLabel} className="h-[300px] md:col-span-2 xl:col-span-4 xl:h-auto" />
    </div>
  );
}

export function RiskView({ data }: ViewProps) {
  const [selected, setSelected] = useState<AtRiskRow | null>(null);
  return (
    <div className={`${GRID} xl:grid-rows-2`}>
      <RiskMap data={data} selected={selected} onSelect={setSelected} className="h-[440px] md:col-span-2 xl:col-span-8 xl:h-auto" />
      <RiskPanel data={data} selected={selected} onClose={() => setSelected(null)} className="md:col-span-2 xl:col-span-4" />
      <CorrelationNetwork data={data} className="h-[440px] md:col-span-2 xl:col-span-6 xl:h-auto" />
      <RuleInsights data={data} className="h-[520px] md:col-span-2 xl:col-span-6 xl:h-auto" />
    </div>
  );
}
