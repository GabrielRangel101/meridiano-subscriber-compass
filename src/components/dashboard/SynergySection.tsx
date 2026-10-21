import type { DashboardData } from "@/lib/dashboard-data";
import { CorrelationNetwork } from "./CorrelationNetwork";
import { MonthlyChanges } from "./MonthlyChanges";
import { RiskMap } from "./RiskMap";
import { RuleInsights } from "./RuleInsights";

export function SynergySection({ data }: { data: DashboardData }) {
  return <section aria-labelledby="synergy-title" className="flex flex-col gap-4 lg:col-span-12">
    <div><h2 id="synergy-title" className="font-display text-2xl font-medium">Sinergia e risco</h2><p className="mt-1 text-sm text-muted-foreground">O que se move junto, quem está prestes a sair e o que o motor de regras encontrou</p></div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12"><CorrelationNetwork data={data} /><MonthlyChanges changes={data.changes} /><RiskMap data={data} /><RuleInsights data={data} /></div>
  </section>;
}