import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard-data";
import { METRIC_LABELS } from "@/lib/dashboard-data";
import { Reveal } from "./Reveal";

const decimal = (r: number) => r.toFixed(2).replace(".", ",");

export function CorrelationNetwork({ data }: { data: DashboardData }) {
  const [mode, setMode] = useState<"diff" | "level">("diff");
  const [node, setNode] = useState<number | null>(null);
  const [edge, setEdge] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const cm = data.correlations[mode];
  const points = cm.keys.map((key, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 4;
    return { key, x: 240 + Math.cos(a) * 132, y: 208 + Math.sin(a) * 132, lx: 240 + Math.cos(a) * 168, ly: 208 + Math.sin(a) * 168 };
  });
  return (
    <Reveal id="correlation-card" index={12} className="min-w-0 lg:col-span-6" aria-labelledby="correlation-title">
      <h3 id="correlation-title" className="font-display text-xl font-medium">Rede de correlação</h3>
      <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Modo da correlação">
        {([['diff', 'Variações mês a mês'], ['level', 'Níveis']] as const).map(([key, label]) => <Button key={key} size="sm" variant={key === mode ? 'default' : 'ghost'} aria-pressed={key === mode} onClick={() => { setMode(key); setEdge(null); }}>{label}</Button>)}
      </div>
      {mode === "level" && <p className="mt-3 text-xs text-warning">Em níveis, séries com tendência parecem correlacionadas sem estarem (correlação espúria)</p>}
      <svg viewBox="0 0 480 420" className="mx-auto w-full max-w-[520px]" aria-label="Rede de correlação entre oito métricas" role="group">
        {cm.edges.map((e) => {
          const a = points[e.i], b = points[e.j];
          const active = node === null || e.i === node || e.j === node;
          const label = `${METRIC_LABELS[e.a]} × ${METRIC_LABELS[e.b]}: r = ${decimal(e.r)}`;
          return <g key={`${e.a}-${e.b}`} opacity={active ? 1 : 0.1}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.r > 0 ? 'var(--primary)' : 'var(--danger)'} strokeWidth={1 + Math.abs(e.r) * 5} strokeOpacity={Math.abs(e.r)} />
            {Math.abs(e.r) >= 0.65 && !reduce && <motion.line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--primary-foreground)" strokeWidth={2} strokeDasharray="3 65" animate={{ strokeDashoffset: [0, -136] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="pointer-events-none" />}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} tabIndex={0} aria-label={label} onMouseEnter={() => setEdge(label)} onMouseLeave={() => setEdge(null)} onFocus={() => setEdge(label)} onBlur={() => setEdge(null)}><title>{label}</title></line>
          </g>;
        })}
        {points.map((p, i) => <g key={p.key} tabIndex={0} aria-label={METRIC_LABELS[p.key]} onMouseEnter={() => setNode(i)} onMouseLeave={() => setNode(null)} onFocus={() => setNode(i)} onBlur={() => setNode(null)} opacity={node === null || node === i ? 1 : 0.4}>
          <circle cx={p.x} cy={p.y} r={14} fill={`var(--cat-${i % 6 + 1})`} stroke="var(--background)" strokeWidth={3} />
          <text x={p.lx} y={p.ly} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={500}>
            {METRIC_LABELS[p.key].split(' ').length > 2 ? <><tspan x={p.lx} dy="-0.2em">{METRIC_LABELS[p.key].split(' ').slice(0, 2).join(' ')}</tspan><tspan x={p.lx} dy="1.3em">{METRIC_LABELS[p.key].split(' ').slice(2).join(' ')}</tspan></> : METRIC_LABELS[p.key]}
          </text>
        </g>)}
      </svg>
      <div className="min-h-10 text-center text-xs font-medium text-foreground" aria-live="polite">{edge}</div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary" />Positiva</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-danger" />Negativa</span><span>|r| ≥ 0,35</span></div>
      <div className="mt-4 border-t pt-3 text-sm"><p className="text-xs text-muted-foreground">n = {cm.n} meses</p>{cm.strongest && <p className="mt-1 font-medium">{METRIC_LABELS[cm.strongest.a]} × {METRIC_LABELS[cm.strongest.b]} <span className="text-primary">r = {decimal(cm.strongest.r)}</span></p>}<p className="mt-3 text-xs text-muted-foreground"><strong className="text-foreground">Defasada:</strong> peso da mídia paga hoje → churn em +3 meses: <strong className="text-primary">r = {decimal(data.lag)}</strong></p></div>
    </Reveal>
  );
}