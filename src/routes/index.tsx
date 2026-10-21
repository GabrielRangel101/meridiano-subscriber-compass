import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { FlowBars } from "@/components/dashboard/FlowBars";
import { PeriodSection } from "@/components/dashboard/PeriodSection";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WaffleCard } from "@/components/dashboard/WaffleCard";
import { useDashboardData } from "@/lib/dashboard-data";
import { SynergySection } from "@/components/dashboard/SynergySection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão geral · Gazeta Meridiano Subscription Intelligence" },
      { name: "description", content: "Painel de assinaturas digitais da Gazeta Meridiano: base ativa, churn, MRR, correlações, assinantes em risco e insights de regras com dados sintéticos." },
      { property: "og:title", content: "Visão geral · Gazeta Meridiano Subscription Intelligence" },
      { property: "og:description", content: "Base ativa, receita, sinergia entre métricas, risco em 90 dias e insights de um jornal fictício." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const data = useDashboardData();
  const { ds, current, kpis, comp, waffle, series } = data;

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={150}>
        <div className="paper-blobs" aria-hidden />
        <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <DashboardHeader brand={ds.meta.brand} monthLabel={current.label} />

          <section id="kpi-section" aria-label="Indicadores principais" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((k, i) => (
              <KpiCard key={k.id} kpi={k} index={i} />
            ))}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <EvolutionChart data={data} index={5} />
            <WaffleCard comp={comp} waffle={waffle} monthLabel={current.label} index={6} />
            <FlowBars series={series} events={ds.meta.events} index={7} />
            <PeriodSection index={8} />
            <SynergySection data={data} />
          </div>
          <DashboardFooter />
        </main>
      </TooltipProvider>
    </MotionConfig>
  );
}
