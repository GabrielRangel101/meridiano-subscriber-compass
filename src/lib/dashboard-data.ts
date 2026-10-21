// Camada de dados do dashboard: chama SOMENTE o motor (src/engine) e monta view-models de apresentação.
import { useMemo } from "react";
import { monthLabel } from "@/engine/calendar";
import { generateDataset } from "@/engine/generate";
import { buildSeries, composition, kpi, projectActive, toWaffle } from "@/engine/metrics";
import type { Kpi } from "@/engine/metrics";
import { fmtBRL, fmtBRLCompact, fmtInt, fmtPP, fmtPct, fmtSignedInt, fmtSignedPct } from "./format";

export type Direction = "up" | "down" | "flat";

export interface DeltaView {
  text: string;
  dir: Direction;
  /** true = bom para o negócio, false = ruim, null = neutro */
  good: boolean | null;
}

export interface KpiView {
  id: string;
  label: string;
  value: number;
  format: (n: number) => string;
  mom: DeltaView;
  yoy: DeltaView | null;
  caption?: string;
  spark: number[];
  kind: "spark" | "gauge";
}

const dirOf = (x: number): Direction => (Math.abs(x) < 1e-9 ? "flat" : x > 0 ? "up" : "down");
const delta = (x: number, text: string, higherIsBetter: boolean): DeltaView => {
  const dir = dirOf(x);
  return { text, dir, good: dir === "flat" ? null : (dir === "up") === higherIsBetter };
};
const prevOf = (k: Kpi) => (k.spark.length >= 2 ? k.spark[k.spark.length - 2] : k.value);

function compute() {
  const ds = generateDataset();
  const series = buildSeries(ds);
  const m = series.length - 1;
  const proj = projectActive(series, ds.meta.goalActive, ds.meta.goalMonth);
  const comp = composition(ds, m, "plan");
  const waffle = toWaffle(comp);

  const kActive = kpi(series, "active", m);
  const kChurn = kpi(series, "churnRate", m);
  const kMrr = kpi(series, "mrr", m);
  const kArpu = kpi(series, "arpu", m);
  const kNps = kpi(series, "nps", m);

  const pctKpi = (id: string, label: string, k: Kpi, format: (n: number) => string): KpiView => ({
    id,
    label,
    value: k.value,
    format,
    mom: delta(k.mom, `${fmtSignedPct(k.mom)} vs mês ant.`, true),
    yoy: k.yoy === null ? null : delta(k.yoy, `${fmtSignedPct(k.yoy)} vs ano ant.`, true),
    spark: k.spark,
    kind: "spark",
  });

  const churnMom = kChurn.value - prevOf(kChurn);
  const npsMom = kNps.value - prevOf(kNps);

  const kpis: KpiView[] = [
    pctKpi("active", "Assinantes ativos", kActive, fmtInt),
    {
      id: "churn",
      label: "Churn mensal",
      value: kChurn.value,
      format: (n) => fmtPct(n, 1),
      mom: delta(churnMom, `${fmtPP(churnMom)} vs mês ant.`, false),
      yoy:
        kChurn.yearAgo === null
          ? null
          : delta(kChurn.value - kChurn.yearAgo, `${fmtPP(kChurn.value - kChurn.yearAgo)} vs ano ant.`, false),
      caption: `meta ${fmtPct(ds.meta.churnTarget, 1)}`,
      spark: kChurn.spark,
      kind: "spark",
    },
    pctKpi("mrr", "MRR", kMrr, fmtBRLCompact),
    pctKpi("arpu", "Ticket médio", kArpu, (n) => fmtBRL(n, 2)),
    {
      id: "nps",
      label: "NPS",
      value: kNps.value,
      format: (n) => `${n > 0 ? "+" : ""}${Math.round(n)}`,
      mom: delta(npsMom, `${fmtSignedInt(npsMom)} pts vs mês ant.`, true),
      yoy:
        kNps.yearAgo === null
          ? null
          : delta(kNps.value - kNps.yearAgo, `${fmtSignedInt(kNps.value - kNps.yearAgo)} pts vs ano ant.`, true),
      caption: "janela móvel de 3 meses",
      spark: kNps.spark,
      kind: "gauge",
    },
  ];

  return {
    ds,
    series,
    m,
    current: series[m],
    proj,
    comp,
    waffle,
    kpis,
    goalLabel: monthLabel(ds.meta.goalMonth).toLowerCase(),
  };
}

export type DashboardData = ReturnType<typeof compute>;

let cache: DashboardData | null = null;
export function getDashboardData(): DashboardData {
  if (!cache) cache = compute();
  return cache;
}

export function useDashboardData(): DashboardData {
  return useMemo(getDashboardData, []);
}

/** Cor categórica estável por plano (mesma em todos os gráficos) */
export const PLAN_COLORS: Record<string, string> = {
  Mensal: "var(--cat-1)",
  Anual: "var(--cat-2)",
  "Combo Streaming": "var(--cat-3)",
  Estudante: "var(--cat-4)",
};
