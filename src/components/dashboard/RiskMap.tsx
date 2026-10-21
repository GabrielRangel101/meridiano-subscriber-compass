import { useEffect, useMemo, useRef, useState } from "react";
import type { AtRiskRow } from "@/engine/metrics";
import type { DashboardData } from "@/lib/dashboard-data";
import { DRIVER_COLORS } from "@/lib/dashboard-data";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { Reveal } from "./Reveal";
import { SubscriberDetail } from "./SubscriberDetail";

function hash(seed: string) { let n = 2166136261; for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
function initials(name: string) { const words = name.split(' '); return `${words[0]?.[0] ?? ''}${words.at(-1)?.[0] ?? ''}`; }

function layoutPeople(rows: AtRiskRow[], width: number) {
  const compact = width < 500;
  const left = 42, right = width - 20, top = 38, bottom = 354;
  const nodes = rows.map((p) => {
    const h = hash(p.avatarSeed);
    const ax = left + p.engagement / 100 * (right - left), ay = bottom - p.risk / 100 * (bottom - top);
    const r = (compact ? 6 : 9) + Math.sqrt(p.mrr / 50) * (compact ? 3 : 5);
    return { p, h, ax, ay, x: ax + (h % 13 - 6), y: ay + ((h >>> 8) % 13 - 6), r };
  });
  // Deterministic collision relaxation affects geometry only, never risk/engagement values.
  for (let step = 0; step < 90; step++) {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x || 0.1, dy = b.y - a.y || 0.1, distance = Math.hypot(dx, dy), target = a.r + b.r + 2;
      if (distance < target) { const move = (target - distance) / 2; a.x -= dx / distance * move; a.y -= dy / distance * move; b.x += dx / distance * move; b.y += dy / distance * move; }
    }
    for (const n of nodes) { n.x = Math.max(left + n.r, Math.min(right - n.r, n.x)); n.y = Math.max(top + n.r, Math.min(bottom - n.r, n.y)); }
  }
  return nodes;
}

export function RiskMap({ data }: { data: DashboardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [hover, setHover] = useState<AtRiskRow | null>(null);
  const [selected, setSelected] = useState<AtRiskRow | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.floor(e.contentRect.width))));
    observer.observe(ref.current); return () => observer.disconnect();
  }, []);
  const nodes = useMemo(() => layoutPeople(data.people, width), [data.people, width]);
  const criticalY = 354 - data.criticalRisk / 100 * 316;
  const stats = [
    { label: 'Assinantes em zona crítica', value: fmtInt(data.risk.critical), note: `${fmtPct(data.risk.criticalShare)} da base`, tone: 'text-danger' },
    { label: 'MRR em risco', value: fmtBRL(data.risk.mrrAtRisk, 0), note: 'receita recorrente mensal', tone: 'text-danger' },
    { label: 'Gatilho principal', value: data.risk.topDriver?.key ?? 'Nenhum', note: data.risk.topDriver ? `${fmtInt(data.risk.topDriver.count)} assinantes críticos` : '—', tone: 'text-foreground' },
    { label: 'Editoria mais exposta', value: data.risk.topEditoria?.key ?? 'Nenhuma', note: data.risk.topEditoria ? `${fmtInt(data.risk.topEditoria.count)} assinantes críticos` : '—', tone: 'text-foreground' },
  ];
  return <Reveal id="risk-card" index={14} className="min-w-0 lg:col-span-12" aria-labelledby="risk-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 id="risk-title" className="font-display text-xl font-medium">Mapa de assinantes em risco</h3><span className="text-xs text-muted-foreground">{data.people.length} assinantes · horizonte de 90 dias</span></div>
    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-y py-4 lg:grid-cols-4">{stats.map((s) => <div key={s.label} className="min-w-0"><dt className="text-xs text-muted-foreground">{s.label}</dt><dd className={`mt-1 break-words font-display text-xl font-medium ${s.tone}`}>{s.value}</dd><dd className="mt-1 text-xs text-muted-foreground">{s.note}</dd></div>)}</dl>
    <div className={`mt-5 grid min-w-0 gap-5 ${selected ? 'lg:grid-cols-[minmax(0,1fr)_280px]' : ''}`}>
      <div ref={ref} className="relative min-w-0" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${width} 400`} className="h-[400px] min-h-[360px] w-full" role="group" aria-label="Assinantes por engajamento e risco de cancelar em 90 dias">
          <rect x={42} y={38} width={width - 62} height={criticalY - 38} fill="var(--danger)" opacity={0.07} />
          <text x={width - 22} y={55} textAnchor="end" fill="var(--danger)" fontSize={11}>Zona crítica ≥ {data.criticalRisk}%</text>
          {[0,25,50,75,100].map((t) => <g key={t}><line x1={42} x2={width - 20} y1={354 - t / 100 * 316} y2={354 - t / 100 * 316} stroke="var(--border)" /><text x={34} y={358 - t / 100 * 316} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">{t}%</text><text x={42 + t / 100 * (width - 62)} y={373} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">{t}</text></g>)}
          <text x={42} y={18} fill="var(--muted-foreground)" fontSize={11}>Risco em 90 dias (%)</text><text x={width / 2} y={394} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>Engajamento</text>
          {nodes.map((n) => <g key={n.p.id} role="button" tabIndex={0} aria-label={`Selecionar ${n.p.name}, risco ${n.p.risk}%`} className="cursor-pointer" onMouseEnter={() => setHover(n.p)} onFocus={() => setHover(n.p)} onBlur={() => setHover(null)} onClick={() => { setSelected(n.p); setHover(null); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(n.p); setHover(null); } }}>
            <circle cx={n.x} cy={n.y} r={n.r + 4} fill="transparent" />
            <circle cx={n.x} cy={n.y} r={n.r} fill={`var(--cat-${n.h % 6 + 1})`} stroke={selected?.id === n.p.id ? 'var(--foreground)' : DRIVER_COLORS[n.p.driver]} strokeWidth={selected?.id === n.p.id ? 3 : 2} />
            <text x={n.x} y={n.y} dy="0.35em" textAnchor="middle" fill="var(--primary-foreground)" fontSize={n.r * 0.78} fontWeight={600} pointerEvents="none">{initials(n.p.name)}</text>
            <title>{`${n.p.name}: engajamento ${n.p.engagement}, risco ${n.p.risk}%, MRR ${fmtBRL(n.p.mrr)}`}</title>
          </g>)}
        </svg>
        {hover && <div className="pointer-events-none absolute left-2 right-2 top-14 z-10 max-w-80"><SubscriberDetail compact person={hover} /></div>}
      </div>
      {selected && <SubscriberDetail person={selected} onClose={() => setSelected(null)} />}
    </div>
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Gatilhos na amostra">{data.drivers.map((d) => <li key={d.key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: d.color }} />{d.key} <strong className="text-foreground">{d.count}</strong></li>)}</ul>
  </Reveal>;
}