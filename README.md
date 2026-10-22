# Meridiano Subscriber Compass

Projeto: dashboard web "Gazeta Meridiano · Subscription Intelligence" (analytics de assinaturas digitais de um jornal FICTÍCIO; dados 100% sintéticos, gerados no navegador). Todo texto de UI em português do Brasil.

ESTA PRIMEIRA MENSAGEM É SÓ O MOTOR DE DADOS (fase 1 de 3). Não faça nenhuma UI além do placeholder descrito no fim.

REGRAS OBRIGATÓRIAS
- Crie os arquivos abaixo em src/engine/ como CÓPIA LITERAL: não reformate, não renomeie, não "melhore", não troque lógica, não adicione dependências, não converta para outra estrutura. São código já testado (23 testes). Qualquer alteração quebra os números.
- Sem backend e sem banco nesta fase: o dataset vem de generateDataset() (determinístico por seed, roda em ~100 ms no navegador).
- Haverá mais 2 arquivos na próxima mensagem (metrics.ts e insights.ts). Não os crie agora.

=== src/engine/types.ts ===
```ts
// Tipos do domínio. Só sintaxe "apagável" (sem enums) para rodar direto no Node e no Vite.

export const CHANNELS = [
  "Orgânico",
  "Newsletter",
  "Mídia paga (Meta)",
  "Mídia paga (Google)",
  "Social orgânico",
  "Parcerias",
  "Direto",
] as const;
export type Channel = (typeof CHANNELS)[number];

export const TOUCHPOINTS = [
  "Paywall de matéria",
  "Botão do header",
  "Pop-up de oferta",
  "CTA de newsletter",
  "Landing de campanha",
] as const;
export type Touchpoint = (typeof TOUCHPOINTS)[number];

export const PLANS = ["Mensal", "Anual", "Combo Streaming", "Estudante"] as const;
export type Plan = (typeof PLANS)[number];

export const EDITORIAS = ["Política", "Esportes", "Economia", "Regional", "Cultura", "Variedades"] as const;
export type Editoria = (typeof EDITORIAS)[number];

export const CANCEL_REASONS = [
  "Preço",
  "Fim da promoção",
  "Pouco uso",
  "Conteúdo não atende",
  "Concorrente",
  "Falha de pagamento",
  "Não renovou",
  "Outros",
] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

export type Nature = "Voluntário" | "Involuntário" | "Fim de contrato";

export type Campaign = "Black Friday" | "Copa 2026" | "Eleições 2026";

/** Assinante ativo nos meses [startMonth, endMonth). endMonth = null → ainda ativo. */
export interface Subscriber {
  id: number;
  name: string;
  avatarSeed: string;
  startMonth: number;
  endMonth: number | null;
  channel: Channel;
  touchpoint: Touchpoint;
  plan: Plan;
  /** Upgrade (ex.: Mensal → Anual) */
  upgradeMonth: number | null;
  planAfter: Plan | null;
  promoDiscount: number; // 0..1
  promoMonths: number;
  engagement: number; // 0..100
  interest: Editoria;
  cancelReason: CancelReason | null;
  nature: Nature | null;
  npsScore: number; // 0..10
  npsRespondent: boolean;
  campaign: Campaign | null;
}

export interface EventMarker {
  month: number;
  label: string;
  kind: "campanha" | "preço" | "evento";
  description: string;
}

export interface DatasetMeta {
  brand: string;
  /** Índice 0 = primeiro mês observado */
  months: number;
  firstMonthLabel: string;
  lastMonthLabel: string;
  events: EventMarker[];
  /** Meta de assinantes ativos ao fim do horizonte de projeção */
  goalActive: number;
  goalMonth: number;
  churnTarget: number; // meta de churn mensal (fração)
  seed: number;
}

export interface Dataset {
  meta: DatasetMeta;
  subscribers: Subscriber[];
}
```

=== src/engine/calendar.ts ===
```ts
// Calendário: mês 0 = nov/2024 … mês 23 = out/2026. Meses negativos = histórico anterior à janela.

export const FIRST_YEAR = 2024;
export const FIRST_CAL_MONTH = 10; // 0-based → novembro

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function calMonth(m: number): number {
  return (((FIRST_CAL_MONTH + m) % 12) + 12) % 12;
}

export function calYear(m: number): number {
  return FIRST_YEAR + Math.floor((FIRST_CAL_MONTH + m) / 12);
}

export function monthLabel(m: number): string {
  return `${MONTHS_PT[calMonth(m)]}/${String(calYear(m)).slice(2)}`;
}

export function monthShort(m: number): string {
  return MONTHS_PT[calMonth(m)];
}

/** Índice do mês para um (ano, mês 1-12) */
export function monthIndex(year: number, month1: number): number {
  return (year - FIRST_YEAR) * 12 + (month1 - 1) - FIRST_CAL_MONTH;
}
```

=== src/engine/rng.ts ===
```ts
// PRNG determinístico (mulberry32) + amostradores. Mesmo seed → mesmo dataset, sempre.

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  normal(mean: number, sd: number): number;
  pick<T>(items: readonly T[], weights?: readonly number[]): T;
  chance(p: number): boolean;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = (mean: number, sd: number) => {
    const u = 1 - next();
    const v = next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    normal,
    chance: (p) => next() < p,
    pick: <T>(items: readonly T[], weights?: readonly number[]): T => {
      if (!weights) return items[Math.floor(next() * items.length)];
      let total = 0;
      for (const w of weights) total += w;
      let r = next() * total;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
      }
      return items[items.length - 1];
    },
  };
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Hash determinístico string → [0,1) (ruído estável para o funil, sem estado) */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
```

=== src/engine/stats.ts ===
```ts
export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: readonly number[]) => (xs.length ? sum(xs) / xs.length : 0);

export function median(xs: readonly number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function stdev(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const mu = mean(xs);
  return Math.sqrt(sum(xs.map((x) => (x - mu) ** 2)) / (xs.length - 1));
}

/** Correlação de Pearson. Retorna 0 se não houver variância ou pontos suficientes. */
export function pearson(xs: readonly number[], ys: readonly number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 4) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

/** Regressão linear simples sobre (0..n-1, ys). */
export function linreg(ys: readonly number[]): { slope: number; intercept: number } {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 };
  const xs = ys.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

export const pctChange = (now: number, before: number) => (before === 0 ? 0 : (now - before) / before);

export const diffs = (xs: readonly number[]) => xs.slice(1).map((x, i) => x - xs[i]);

export const round = (x: number, d = 1) => {
  const f = 10 ** d;
  return Math.round(x * f) / f;
};
```

=== src/engine/model.ts ===
```ts
// Modelo de negócio compartilhado: preços, eventos e o hazard de churn.
// O MESMO hazard alimenta (a) a simulação que gera o dataset e (b) o "risco de saída" do dashboard.
// Assim o que o dashboard mostra como risco é coerente com o comportamento real dos dados.

import { monthIndex } from "./calendar";
import { clamp } from "./rng";
import type { Channel, EventMarker, Plan, Subscriber } from "./types";

export const EVENT_BLACK_FRIDAY_24 = monthIndex(2024, 11); // 0
export const EVENT_BLACK_FRIDAY_25 = monthIndex(2025, 11); // 12
export const EVENT_COPA_START = monthIndex(2026, 6); // 19
export const EVENT_COPA_END = monthIndex(2026, 7); // 20
export const EVENT_REAJUSTE = monthIndex(2026, 7); // 20
export const EVENT_ELEICOES_START = monthIndex(2026, 9); // 22
export const EVENT_ELEICOES_END = monthIndex(2026, 10); // 23

export const EVENTS: EventMarker[] = [
  { month: EVENT_BLACK_FRIDAY_24, label: "Black Friday 24", kind: "campanha", description: "Campanha de Black Friday com 60% de desconto por 3 meses." },
  { month: EVENT_BLACK_FRIDAY_25, label: "Black Friday 25", kind: "campanha", description: "Maior campanha do período: aquisição 2,4x a média, majoritariamente mídia paga." },
  { month: EVENT_COPA_START, label: "Copa 2026", kind: "evento", description: "Passe Copa: oferta promocional de curta duração para o público de Esportes." },
  { month: EVENT_REAJUSTE, label: "Reajuste de preço", kind: "preço", description: "Planos Mensal e Combo reajustados (+12% e +11%)." },
  { month: EVENT_ELEICOES_START, label: "Eleições 2026", kind: "evento", description: "Cobertura eleitoral impulsiona aquisição orgânica e social." },
];

export const LAST_MONTH = 23;
export const FIRST_SIM_MONTH = -18;

/** Preço mensal-equivalente de tabela, por plano e mês (reajuste em jul/26) */
export function listPrice(plan: Plan, m: number): number {
  const hiked = m >= EVENT_REAJUSTE;
  switch (plan) {
    case "Mensal":
      return hiked ? 33.5 : 29.9;
    case "Combo Streaming":
      return hiked ? 49.9 : 44.9;
    case "Anual":
      return 24.92; // R$ 299/12 — renovação sem reajuste no período
    case "Estudante":
      return 14.9;
  }
}

export function planAt(s: Pick<Subscriber, "plan" | "planAfter" | "upgradeMonth">, m: number): Plan {
  return s.upgradeMonth !== null && s.planAfter !== null && m >= s.upgradeMonth ? s.planAfter : s.plan;
}

export function isActiveAt(s: Pick<Subscriber, "startMonth" | "endMonth">, m: number): boolean {
  return s.startMonth <= m && (s.endMonth === null || m < s.endMonth);
}

/** Receita recorrente mensal (MRR) do assinante no mês m (0 se inativo) */
export function mrrAt(s: Subscriber, m: number): number {
  if (!isActiveAt(s, m)) return 0;
  const plan = planAt(s, m);
  const base = listPrice(plan, m);
  const inPromo = s.promoDiscount > 0 && m < s.startMonth + s.promoMonths && plan === s.plan;
  return Math.round(base * (inPromo ? 1 - s.promoDiscount : 1) * 100) / 100;
}

// ---------------------------------------------------------------- hazard de churn

const BASE_HAZARD: Record<Plan, number> = {
  Mensal: 0.034,
  "Combo Streaming": 0.024,
  Estudante: 0.04,
  Anual: 0, // churn só na renovação
};

export const CHANNEL_HAZARD: Record<Channel, number> = {
  Orgânico: 0.8,
  Newsletter: 0.6,
  "Mídia paga (Meta)": 1.5,
  "Mídia paga (Google)": 1.3,
  "Social orgânico": 1.2,
  Parcerias: 1.0,
  Direto: 1.0,
};

export const PAYMENT_FAILURE_RATE = 0.006;
const ANNUAL_RENEWAL_CHURN = 0.26;

export interface Hazard {
  /** Probabilidade total de cancelar em m (decisão ao fim do mês anterior) */
  total: number;
  /** Componente involuntário (falha de pagamento) */
  involuntary: number;
  /** Mês em que o preço cheio chega para quem estava em promoção */
  promoCliff: boolean;
  /** Mês afetado pelo reajuste de preço */
  priceHike: boolean;
  /** Fim de contrato anual */
  renewal: boolean;
  /** Efeito pós-Copa */
  postEvent: boolean;
}

/**
 * Probabilidade de o assinante cancelar no mês m. Só depende de atributos observáveis,
 * então pode ser usada tanto na simulação quanto no score de risco do dashboard.
 */
export function hazardAt(s: Subscriber, m: number): Hazard {
  const age = m - s.startMonth;
  const plan = planAt(s, m);
  const engF = clamp(Math.exp((-1.6 * (s.engagement - 55)) / 45), 0.3, 3);

  if (plan === "Anual") {
    const anchor = s.upgradeMonth !== null && s.planAfter === "Anual" ? s.upgradeMonth : s.startMonth;
    const renewal = m > anchor && (m - anchor) % 12 === 0;
    const p = renewal ? clamp(ANNUAL_RENEWAL_CHURN * CHANNEL_HAZARD[s.channel] * (engF * 0.6 + 0.4), 0.05, 0.8) : 0;
    return {
      total: p + PAYMENT_FAILURE_RATE / 3,
      involuntary: PAYMENT_FAILURE_RATE / 3,
      promoCliff: false,
      priceHike: false,
      renewal,
      postEvent: false,
    };
  }

  const tenureF = age <= 1 ? 1.5 : age === 2 ? 1.35 : age === 3 ? 1.2 : age > 12 ? 0.9 : 1;
  const onPromoPlan = plan === s.plan && s.promoDiscount > 0;
  const cliff = onPromoPlan && age === s.promoMonths;
  const afterCliff = onPromoPlan && age === s.promoMonths + 1;
  const promoF = cliff ? 3.0 * (0.6 + s.promoDiscount) : afterCliff ? 1.6 : 1;
  const hike = (plan === "Mensal" || plan === "Combo Streaming") && (m === EVENT_REAJUSTE || m === EVENT_REAJUSTE + 1);
  const hikeF = hike ? (m === EVENT_REAJUSTE ? 1.7 : 1.3) : 1;
  const postEvent = s.campaign === "Copa 2026" && m > EVENT_COPA_END && m <= EVENT_COPA_END + 3;
  const eventF = postEvent ? 1.9 : 1;

  const voluntary = BASE_HAZARD[plan] * CHANNEL_HAZARD[s.channel] * engF * tenureF * promoF * hikeF * eventF;
  const total = clamp(voluntary + PAYMENT_FAILURE_RATE, 0, 0.9);
  return { total, involuntary: PAYMENT_FAILURE_RATE, promoCliff: cliff || afterCliff, priceHike: hike, renewal: false, postEvent };
}

/** Risco de cancelar nos próximos `horizon` meses, em % (0–100) */
export function churnRisk(s: Subscriber, fromMonth: number, horizon = 3): number {
  let survive = 1;
  for (let i = 1; i <= horizon; i++) survive *= 1 - hazardAt(s, fromMonth + i).total;
  return Math.round((1 - survive) * 1000) / 10;
}
```

=== src/engine/generate.ts ===
```ts
// Gerador do dataset sintético da "Gazeta Meridiano" (marca fictícia).
// Tudo é determinístico por seed e 100% fictício (nomes, números, eventos).
//
// Histórias plantadas (o motor de insights deve ENCONTRÁ-LAS, não recebê-las prontas):
//  1. Black Friday 25: aquisição 2,4x, majoritariamente mídia paga com 60% off por 3 meses
//     → "penhasco" de cancelamento quando o preço cheio chega (fev/26) e retenção pior que as demais safras.
//  2. Mídia paga retém pior que Newsletter/Orgânico, em qualquer safra.
//  3. Reajuste de jul/26 eleva o churn de Mensal e Combo por dois meses.
//  4. Copa 2026: pico de Esportes, depois queda de interesse e churn acima do normal.
//  5. Eleições 2026: pico de aquisição orgânica/social em set–out.
//  6. ~1 em cada 6 cancelamentos é involuntário (falha de pagamento) — alavanca barata de recuperação.

import { calMonth, monthLabel } from "./calendar";
import {
  EVENTS,
  EVENT_BLACK_FRIDAY_24,
  EVENT_BLACK_FRIDAY_25,
  EVENT_COPA_END,
  EVENT_COPA_START,
  EVENT_ELEICOES_END,
  EVENT_ELEICOES_START,
  FIRST_SIM_MONTH,
  LAST_MONTH,
  hazardAt,
  isActiveAt,
  mrrAt,
  planAt,
} from "./model";
import { clamp, createRng } from "./rng";
import type { Rng } from "./rng";
import { CHANNELS, EDITORIAS, PLANS, TOUCHPOINTS } from "./types";
import type {
  Campaign,
  CancelReason,
  Channel,
  Dataset,
  Editoria,
  Nature,
  Plan,
  Subscriber,
  Touchpoint,
} from "./types";

const FIRST = [
  "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique", "Isabela", "João",
  "Karina", "Lucas", "Mariana", "Nicolas", "Olívia", "Pedro", "Rafaela", "Sérgio", "Tatiane", "Vinícius",
  "Alice", "Bernardo", "Camila", "Daniel", "Elisa", "Fábio", "Giovana", "Heitor", "Ingrid", "Júlio",
  "Larissa", "Matheus", "Natália", "Otávio", "Paula", "Rodrigo", "Sabrina", "Thiago", "Valentina", "Yuri",
];
const LAST = [
  "Almeida", "Barros", "Cardoso", "Duarte", "Esteves", "Fontana", "Gomes", "Hoffmann", "Ibarra", "Jardim",
  "Klein", "Lima", "Machado", "Nunes", "Oliveira", "Pereira", "Quadros", "Ribeiro", "Schmidt", "Teixeira",
  "Uliana", "Vargas", "Weber", "Xavier", "Zanella", "Moraes", "Rocha", "Siqueira", "Bittencourt", "Farias",
];

const CHANNEL_BASE_ENGAGEMENT: Record<Channel, number> = {
  Orgânico: 62,
  Newsletter: 72,
  "Mídia paga (Meta)": 45,
  "Mídia paga (Google)": 50,
  "Social orgânico": 48,
  Parcerias: 55,
  Direto: 58,
};
const EDITORIA_ENGAGEMENT_ADJ: Record<Editoria, number> = { Política: 3, Esportes: 0, Economia: 2, Regional: 7, Cultura: -2, Variedades: -9 };
const PLAN_ENGAGEMENT_ADJ: Record<Plan, number> = { Mensal: 0, Anual: 6, "Combo Streaming": 4, Estudante: -4 };

const BASE_CHANNEL_W: Record<Channel, number> = {
  Orgânico: 0.26,
  Newsletter: 0.17,
  "Mídia paga (Meta)": 0.17,
  "Mídia paga (Google)": 0.15,
  "Social orgânico": 0.09,
  Parcerias: 0.08,
  Direto: 0.08,
};

const BASE_PLAN_W: Record<Channel, Record<Plan, number>> = {
  Orgânico: { Mensal: 0.5, Anual: 0.2, "Combo Streaming": 0.2, Estudante: 0.1 },
  Newsletter: { Mensal: 0.4, Anual: 0.32, "Combo Streaming": 0.2, Estudante: 0.08 },
  "Mídia paga (Meta)": { Mensal: 0.6, Anual: 0.1, "Combo Streaming": 0.15, Estudante: 0.15 },
  "Mídia paga (Google)": { Mensal: 0.58, Anual: 0.12, "Combo Streaming": 0.18, Estudante: 0.12 },
  "Social orgânico": { Mensal: 0.58, Anual: 0.1, "Combo Streaming": 0.14, Estudante: 0.18 },
  Parcerias: { Mensal: 0.35, Anual: 0.15, "Combo Streaming": 0.4, Estudante: 0.1 },
  Direto: { Mensal: 0.5, Anual: 0.22, "Combo Streaming": 0.2, Estudante: 0.08 },
};

const TOUCHPOINT_W: Record<Channel, Record<Touchpoint, number>> = {
  Orgânico: { "Paywall de matéria": 0.62, "Botão do header": 0.22, "Pop-up de oferta": 0.14, "CTA de newsletter": 0.0, "Landing de campanha": 0.02 },
  Newsletter: { "Paywall de matéria": 0.1, "Botão do header": 0.0, "Pop-up de oferta": 0.05, "CTA de newsletter": 0.85, "Landing de campanha": 0.0 },
  "Mídia paga (Meta)": { "Paywall de matéria": 0.1, "Botão do header": 0.02, "Pop-up de oferta": 0.18, "CTA de newsletter": 0.0, "Landing de campanha": 0.7 },
  "Mídia paga (Google)": { "Paywall de matéria": 0.22, "Botão do header": 0.04, "Pop-up de oferta": 0.14, "CTA de newsletter": 0.0, "Landing de campanha": 0.6 },
  "Social orgânico": { "Paywall de matéria": 0.55, "Botão do header": 0.1, "Pop-up de oferta": 0.3, "CTA de newsletter": 0.0, "Landing de campanha": 0.05 },
  Parcerias: { "Paywall de matéria": 0.1, "Botão do header": 0.1, "Pop-up de oferta": 0.1, "CTA de newsletter": 0.0, "Landing de campanha": 0.7 },
  Direto: { "Paywall de matéria": 0.3, "Botão do header": 0.5, "Pop-up de oferta": 0.18, "CTA de newsletter": 0.0, "Landing de campanha": 0.02 },
};

const SEASON = [1.05, 0.95, 0.95, 0.9, 0.9, 0.9, 0.95, 0.95, 1.0, 1.05, 1.2, 1.0]; // por mês do calendário (jan…dez)
const BASE_ACQUISITION = 255;

interface CampaignSpec {
  campaign: Campaign;
  /** aquisição extra como fração da base do mês */
  extra: number;
  channelW: Record<Channel, number>;
  planW: Record<Plan, number>;
  promoDiscount: number;
  promoMonths: number;
  engagementShift: number;
  interestBoost?: { editoria: Editoria; p: number };
}

function campaignSpecs(m: number): CampaignSpec[] {
  const specs: CampaignSpec[] = [];
  const bfChannels: Record<Channel, number> = {
    Orgânico: 0.1, Newsletter: 0.1, "Mídia paga (Meta)": 0.3, "Mídia paga (Google)": 0.25,
    "Social orgânico": 0.05, Parcerias: 0.05, Direto: 0.15,
  };
  const bfPlans: Record<Plan, number> = { Mensal: 0.6, Anual: 0.1, "Combo Streaming": 0.25, Estudante: 0.05 };
  if (m === EVENT_BLACK_FRIDAY_25) {
    specs.push({ campaign: "Black Friday", extra: 1.4, channelW: bfChannels, planW: bfPlans, promoDiscount: 0.6, promoMonths: 3, engagementShift: -10 });
  } else if (m === EVENT_BLACK_FRIDAY_24 || m === EVENT_BLACK_FRIDAY_25 - 12) {
    specs.push({ campaign: "Black Friday", extra: 0.8, channelW: bfChannels, planW: bfPlans, promoDiscount: 0.6, promoMonths: 3, engagementShift: -10 });
  }
  if (m === EVENT_COPA_START || m === EVENT_COPA_END) {
    specs.push({
      campaign: "Copa 2026",
      extra: m === EVENT_COPA_START ? 0.5 : 0.7,
      channelW: { Orgânico: 0.3, Newsletter: 0.08, "Mídia paga (Meta)": 0.1, "Mídia paga (Google)": 0.08, "Social orgânico": 0.28, Parcerias: 0.04, Direto: 0.12 },
      planW: { Mensal: 0.7, Anual: 0.0, "Combo Streaming": 0.2, Estudante: 0.1 },
      promoDiscount: 0.5, promoMonths: 2, engagementShift: 0,
      interestBoost: { editoria: "Esportes", p: 0.9 },
    });
  }
  if (m === EVENT_ELEICOES_START || m === EVENT_ELEICOES_END) {
    specs.push({
      campaign: "Eleições 2026",
      extra: m === EVENT_ELEICOES_START ? 0.35 : 0.6,
      channelW: { Orgânico: 0.35, Newsletter: 0.1, "Mídia paga (Meta)": 0.08, "Mídia paga (Google)": 0.07, "Social orgânico": 0.25, Parcerias: 0.05, Direto: 0.1 },
      planW: { Mensal: 0.55, Anual: 0.2, "Combo Streaming": 0.15, Estudante: 0.1 },
      promoDiscount: 0.4, promoMonths: 2, engagementShift: 4,
      interestBoost: { editoria: "Política", p: 0.85 },
    });
  }
  return specs;
}

function weights<T extends string>(keys: readonly T[], table: Record<T, number>): number[] {
  return keys.map((k) => table[k]);
}

function makeSubscriber(rng: Rng, id: number, startMonth: number, spec: CampaignSpec | null): Subscriber {
  const channel = rng.pick(CHANNELS, weights(CHANNELS, spec ? spec.channelW : BASE_CHANNEL_W));
  const plan = rng.pick(PLANS, weights(PLANS, spec ? spec.planW : BASE_PLAN_W[channel]));
  const touchpoint = rng.pick(TOUCHPOINTS, weights(TOUCHPOINTS, TOUCHPOINT_W[channel]));

  let promoDiscount = 0;
  let promoMonths = 0;
  if (plan === "Anual") {
    promoDiscount = rng.chance(0.3) ? 0.2 : 0;
    promoMonths = promoDiscount > 0 ? 12 : 0;
  } else if (plan !== "Estudante") {
    if (spec) {
      promoDiscount = spec.promoDiscount;
      promoMonths = spec.promoMonths;
    } else if (rng.chance(channel.startsWith("Mídia paga") ? 0.5 : 0.3)) {
      promoDiscount = 0.5;
      promoMonths = 3;
    }
  }

  const interest: Editoria =
    spec?.interestBoost && rng.chance(spec.interestBoost.p)
      ? spec.interestBoost.editoria
      : rng.pick(EDITORIAS, [0.24, 0.2, 0.14, 0.2, 0.1, 0.12]);

  const engagement = Math.round(
    clamp(
      rng.normal(CHANNEL_BASE_ENGAGEMENT[channel] + PLAN_ENGAGEMENT_ADJ[plan] + EDITORIA_ENGAGEMENT_ADJ[interest] + (spec?.engagementShift ?? 0), 14),
      5,
      98,
    ),
  );

  const npsScore = Math.round(clamp(rng.normal(3.2 + (engagement / 100) * 8, 1.8), 0, 10));
  const npsRespondent = rng.chance(engagement > 60 ? 0.28 : 0.2);

  const name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`;
  return {
    id,
    name,
    avatarSeed: `${name.replace(/\s/g, "-")}-${id}`.toLowerCase(),
    startMonth,
    endMonth: null,
    channel,
    touchpoint,
    plan,
    upgradeMonth: null,
    planAfter: null,
    promoDiscount,
    promoMonths,
    engagement,
    interest,
    cancelReason: null,
    nature: null,
    npsScore,
    npsRespondent,
    campaign: spec?.campaign ?? null,
  };
}

function reasonFor(rng: Rng, s: Subscriber, m: number): { reason: CancelReason; nature: Nature } {
  const h = hazardAt(s, m);
  if (h.renewal && rng.chance(1 - h.involuntary / h.total)) return { reason: "Não renovou", nature: "Fim de contrato" };
  if (rng.chance(h.involuntary / h.total)) return { reason: "Falha de pagamento", nature: "Involuntário" };
  const table: [CancelReason, number][] = h.promoCliff
    ? [["Fim da promoção", 0.65], ["Preço", 0.2], ["Pouco uso", 0.1], ["Outros", 0.05]]
    : h.priceHike
      ? [["Preço", 0.6], ["Concorrente", 0.12], ["Pouco uso", 0.18], ["Outros", 0.1]]
      : s.engagement < 45
        ? [["Pouco uso", 0.5], ["Preço", 0.2], ["Concorrente", 0.1], ["Conteúdo não atende", 0.1], ["Outros", 0.1]]
        : [["Preço", 0.35], ["Pouco uso", 0.2], ["Concorrente", 0.2], ["Conteúdo não atende", 0.15], ["Outros", 0.1]];
  const reason = rng.pick(table.map((t) => t[0]), table.map((t) => t[1]));
  return { reason, nature: "Voluntário" };
}

function simulate(rng: Rng, s: Subscriber): void {
  let upgraded = false;
  for (let m = s.startMonth + 1; m <= LAST_MONTH; m++) {
    const h = hazardAt(s, m);
    if (rng.chance(h.total)) {
      const r = reasonFor(rng, s, m);
      s.endMonth = m;
      s.cancelReason = r.reason;
      s.nature = r.nature;
      break;
    }
    if (!upgraded && planAt(s, m) === "Mensal" && m - s.startMonth >= 2 && s.engagement >= 62 && rng.chance(0.015)) {
      upgraded = true;
      s.upgradeMonth = m + 1;
      s.planAfter = rng.chance(0.65) ? "Anual" : "Combo Streaming";
    }
  }
  // upgrade só vale se o assinante sobreviveu ao mês do upgrade
  if (s.endMonth !== null && s.upgradeMonth !== null && s.upgradeMonth >= s.endMonth) {
    s.upgradeMonth = null;
    s.planAfter = null;
  }
}

export function generateDataset(seed = 20261021): Dataset {
  const rng = createRng(seed);
  const all: Subscriber[] = [];
  let id = 0;

  for (let m = FIRST_SIM_MONTH; m <= LAST_MONTH; m++) {
    const lambda = BASE_ACQUISITION * (1 + 0.01 * m) * SEASON[calMonth(m)];
    const baseCount = Math.max(0, Math.round(rng.normal(lambda, Math.sqrt(lambda))));
    for (let i = 0; i < baseCount; i++) all.push(makeSubscriber(rng, ++id, m, null));
    for (const spec of campaignSpecs(m)) {
      const extraCount = Math.max(0, Math.round(rng.normal(lambda * spec.extra, Math.sqrt(lambda * spec.extra))));
      for (let i = 0; i < extraCount; i++) all.push(makeSubscriber(rng, ++id, m, spec));
    }
  }

  for (const s of all) simulate(rng, s);

  // mantém só quem estava ativo em algum momento da janela observada (0..23)
  const subscribers = all
    .filter((s) => s.endMonth === null || s.endMonth >= 0)
    .sort((a, b) => a.startMonth - b.startMonth || a.id - b.id)
    .map((s, i) => ({ ...s, id: i + 1 }));

  const lastActive = subscribers.filter((s) => isActiveAt(s, LAST_MONTH)).length;
  return {
    meta: {
      brand: "Gazeta Meridiano",
      months: LAST_MONTH + 1,
      firstMonthLabel: monthLabel(0),
      lastMonthLabel: monthLabel(LAST_MONTH),
      events: EVENTS,
      goalActive: Math.ceil((lastActive * 1.09) / 100) * 100,
      goalMonth: LAST_MONTH + 2, // dez/26
      churnTarget: 0.03,
      seed,
    },
    subscribers,
  };
}

/** MRR total em m (conveniência para validação) */
export function totalMrr(ds: Dataset, m: number): number {
  let t = 0;
  for (const s of ds.subscribers) t += mrrAt(s, m);
  return t;
}
```

PLACEHOLDER (única UI desta fase)
Em src/pages/Index.tsx (ou o componente da rota "/"), mostre uma página simples e limpa que chama generateDataset() uma vez (useMemo) e exibe: o nome da marca (ds.meta.brand), o nº total de assinantes em ds.subscribers e a lista de ds.meta.events (label + mês via monthLabel). Nada de gráficos ainda. Garanta que o build passa sem erros de TypeScript.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://meridiano-subscriber-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9525983d-ee3e-40e8-9355-73ca867358dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
