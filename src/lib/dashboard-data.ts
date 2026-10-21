// Camada de dados do dashboard: chama SOMENTE o motor (src/engine) e monta view-models de apresentação.
import { useMemo } from "react";
import { monthLabel } from "@/engine/calendar";
import { generateDataset } from "@/engine/generate";
import { atRisk, buildSeries, churnReasons, composition, correlationMatrix, CRITICAL_RISK, funnelByChannel, kpi, lagCorrelation, peopleMap, projectActive, subscriberFlow, toWaffle } from "@/engine/metrics";
import type { AtRiskRow, CorrelationMatrix, Kpi, MonthPoint, SeriesKey } from "@/engine/metrics";
import { generateInsights } from "@/engine/insights";
import type { Insight, Severity } from "@/engine/insights";
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
  // Each expensive engine entry point runs once, inside the shared memoized computation.
  const risk = atRisk(ds, m);
  const people = peopleMap(ds, m, 60);
  const insights = generateInsights(ds);
  const correlations = {
    diff: correlationView(correlationMatrix(series, CORRELATION_KEYS, "diff")),
    level: correlationView(correlationMatrix(series, CORRELATION_KEYS, "level")),
  };
  const changes = CHANGE_KEYS.map((key) => monthlyChange(series, key, m)).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const drivers = DRIVER_ORDER.map((key) => ({ key, color: DRIVER_COLORS[key], count: people.filter((p) => p.driver === key).length }));

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
    risk,
    people,
    drivers,
    criticalRisk: CRITICAL_RISK,
    correlations,
    lag: lagCorrelation(series, "paidShareNew", "churnRate", 3),
    changes,
    insights: insights.map((insight) => ({ ...insight, displayValue: formatInsightValue(insight) })),
    severityCounts: SEVERITIES.map((key) => ({ key, count: insights.filter((i) => i.severity === key).length })),
    topics: [...new Set(insights.map((i) => i.topic))].map((key) => ({ key, count: insights.filter((i) => i.topic === key).length })),
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

// ------------------------------------------------------------------ período (Sankey, motivos, funil)

export const PERIOD_OPTIONS = [
  { n: 3, label: "Últimos 3 meses" },
  { n: 6, label: "Últimos 6 meses" },
  { n: 12, label: "12 meses" },
] as const;
export type PeriodN = (typeof PERIOD_OPTIONS)[number]["n"];

const NATURE_ORDER = ["Voluntário", "Involuntário", "Fim de contrato"];

function computePeriod(n: PeriodN) {
  const { ds, m, series } = getDashboardData();
  const m0 = m - n + 1;
  const m1 = m;
  const flow = subscriberFlow(ds, m0, m1);
  const outcomeGroup = new Map(flow.nodes.map((nd) => [nd.id, nd]));
  const sumTo = (pred: (id: string) => boolean) => flow.links.filter((l) => pred(l.target)).reduce((a, l) => a + l.value, 0);
  const flowSummary = {
    cancelled: sumTo((id) => outcomeGroup.get(id)?.group === "negativo"),
    upgrades: sumTo((id) => id === "out:upgrade"),
    stayed: sumTo((id) => id === "out:stay"),
  };

  const reasons = churnReasons(ds, m0, m1);
  const natureRank = (n: string) => {
    const i = NATURE_ORDER.indexOf(n);
    return i === -1 ? 99 : i;
  };
  const byNature = [...reasons.byNature].sort((a, b) => natureRank(a.nature) - natureRank(b.nature));
  const reasonRows = [...reasons.rows].sort((a, b) => natureRank(a.nature) - natureRank(b.nature) || b.count - a.count);

  const funnel = funnelByChannel(ds, m0, m1);
  const byOverall = [...funnel].sort((a, b) => b.overall - a.overall);

  return {
    n,
    m0,
    m1,
    rangeLabel: `${series[m0].label} – ${series[m1].label}`,
    flow,
    flowSummary,
    reasons: { total: reasons.total, byNature, rows: reasonRows },
    funnel,
    bestChannel: byOverall[0]?.channel ?? null,
    worstChannel: byOverall[byOverall.length - 1]?.channel ?? null,
  };
}

export type PeriodData = ReturnType<typeof computePeriod>;
const periodCache = new Map<PeriodN, PeriodData>();
export function getPeriodData(n: PeriodN): PeriodData {
  let p = periodCache.get(n);
  if (!p) periodCache.set(n, (p = computePeriod(n)));
  return p;
}
export function usePeriodData(n: PeriodN): PeriodData {
  return useMemo(() => getPeriodData(n), [n]);
}

/** Cores por natureza do cancelamento; motivos usam tons da cor da natureza */
export const NATURE_COLORS: Record<string, string> = {
  Voluntário: "var(--cat-1)",
  Involuntário: "var(--danger)",
  "Fim de contrato": "var(--cat-3)",
};

export const METRIC_LABELS: Record<SeriesKey, string> = {
  newSubs: "novas assinaturas", cancelled: "cancelamentos", churnRate: "churn", nps: "NPS",
  arpu: "ticket médio", mrr: "MRR", avgEngagement: "engajamento", paidShareNew: "peso da mídia paga", active: "base ativa", upgrades: "upgrades",
};
const CORRELATION_KEYS: SeriesKey[] = ["newSubs", "cancelled", "churnRate", "nps", "arpu", "avgEngagement", "paidShareNew", "mrr"];
const CHANGE_KEYS: SeriesKey[] = ["active", "newSubs", "cancelled", "churnRate", "mrr", "arpu", "nps", "avgEngagement"];
export const SEVERITIES: Severity[] = ["perigo", "atenção", "positivo", "info"];
export const DRIVER_ORDER: AtRiskRow["driver"][] = ["promoção acabando", "baixo engajamento", "renovação anual", "canal de risco", "geral"];
export const DRIVER_COLORS: Record<AtRiskRow["driver"], string> = {
  "promoção acabando": "var(--cat-3)", "baixo engajamento": "var(--danger)", "renovação anual": "var(--cat-2)", "canal de risco": "var(--cat-4)", geral: "var(--cat-6)",
};
export const INSIGHT_TARGETS: Record<Insight["topic"], string> = {
  base: "evolution-card", churn: "evolution-card", meta: "evolution-card", coortes: "funnel-card", canais: "funnel-card", pagamento: "reasons-card", correlação: "correlation-card", risco: "risk-card", editorias: "risk-card", preço: "kpi-section", nps: "kpi-section",
};

export function correlationView(cm: CorrelationMatrix) {
  const pairs = cm.keys.flatMap((a, i) => cm.keys.slice(i + 1).map((b, offset) => ({ a, b, i, j: i + offset + 1, r: cm.r[i][i + offset + 1] })));
  const strongest = [...pairs].sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0];
  return { ...cm, edges: pairs.filter((p) => Math.abs(p.r) >= 0.35), strongest };
}

export function monthlyChange(series: MonthPoint[], key: SeriesKey, m: number) {
  const metric = kpi(series, key, m);
  const before = metric.spark.at(-2) ?? metric.value;
  const value = key === "nps" || key === "churnRate" ? metric.value - before : metric.mom;
  const unit = key === "nps" ? "pontos" : key === "churnRate" ? "p.p." : "%";
  const formatted = key === "nps" ? `${fmtSignedInt(value)} pts` : key === "churnRate" ? fmtPP(value) : fmtSignedPct(value);
  return { key, label: METRIC_LABELS[key], value, unit, formatted, dir: dirOf(value), good: value === 0 ? null : (value > 0) === !(key === "cancelled" || key === "churnRate") };
}

export function formatInsightValue(i: Insight): string | null {
  if (i.value === null) return null;
  if (i.topic === "correlação") return `r = ${i.value.toFixed(2).replace(".", ",")}`;
  if (i.topic === "coortes" || i.topic === "canais" || i.id === "reajuste") return fmtPP(i.value);
  if (i.topic === "nps") return `${fmtSignedInt(i.value)} pts`;
  if (["churn", "pagamento"].includes(i.topic) || i.id === "penhasco-promo") return fmtPct(i.value);
  return fmtInt(i.value);
}
