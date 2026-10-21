import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard-data";
import { INSIGHT_TARGETS } from "@/lib/dashboard-data";
import type { Insight, Severity } from "@/engine/insights";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const tones: Record<Severity, string> = { perigo: 'bg-danger/10 text-danger', atenção: 'bg-accent/10 text-warning', positivo: 'bg-positive/10 text-positive', info: 'bg-primary/10 text-primary' };

export function RuleInsights({ data }: { data: DashboardData }) {
  const [severity, setSeverity] = useState<Severity | 'todos'>('todos');
  const [topic, setTopic] = useState<Insight['topic'] | 'todos'>('todos');
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  const filtered = useMemo(() => data.insights.filter((i) => (severity === 'todos' || i.severity === severity) && (topic === 'todos' || i.topic === topic)), [data.insights, severity, topic]);
  function reveal(insight: Insight) {
    const card = document.getElementById(INSIGHT_TARGETS[insight.topic]);
    if (!card) return;
    card.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'center' });
    card.classList.remove('insight-highlight');
    void card.offsetWidth;
    card.classList.add('insight-highlight');
    window.setTimeout(() => card.classList.remove('insight-highlight'), 1200);
  }
  return <Reveal index={15} className="min-w-0 lg:col-span-12" aria-labelledby="insights-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 id="insights-title" className="font-display text-xl font-medium">Insights do motor de regras</h3><span className="text-xs text-muted-foreground">{filtered.length} achados</span></div>
    <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por severidade"><Button size="sm" variant={severity === 'todos' ? 'default' : 'ghost'} aria-pressed={severity === 'todos'} onClick={() => { setSeverity('todos'); setExpanded(false); }}>Todos ({data.insights.length})</Button>{data.severityCounts.map((s) => <Button key={s.key} size="sm" variant="ghost" aria-pressed={severity === s.key} className={cn('capitalize', severity === s.key && tones[s.key])} onClick={() => { setSeverity(s.key); setExpanded(false); }}>{s.key} ({s.count})</Button>)}</div>
    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tema"><Button size="sm" variant={topic === 'todos' ? 'secondary' : 'ghost'} aria-pressed={topic === 'todos'} onClick={() => { setTopic('todos'); setExpanded(false); }}>Todos os temas</Button>{data.topics.map((t) => <Button size="sm" key={t.key} variant={topic === t.key ? 'secondary' : 'ghost'} aria-pressed={topic === t.key} className="capitalize" onClick={() => { setTopic(t.key); setExpanded(false); }}>{t.key} ({t.count})</Button>)}</div>
    <ul className="mt-4 divide-y">{(expanded ? filtered : filtered.slice(0,6)).map((i) => <li key={i.id} className="py-4">
      <Button variant="ghost" className="h-auto w-full items-start justify-start whitespace-normal p-0 text-left hover:bg-transparent" onClick={() => reveal(i)} aria-label={`Ver seção relacionada: ${i.title}`}>
        <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', tones[i.severity])}>{i.severity}</span><span className="text-xs font-normal capitalize text-muted-foreground">{i.topic}</span>{i.displayValue && <strong className="ml-auto font-display text-lg text-foreground">{i.displayValue}</strong>}</div><h4 className="font-display text-lg font-medium">{i.title}</h4><p className="mt-1 text-sm font-normal leading-relaxed text-muted-foreground">{i.text}</p></div><ArrowUpRight className="mt-2 shrink-0 text-primary" />
      </Button>
    </li>)}</ul>
    {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum achado neste filtro.</p>}
    {filtered.length > 6 && <div className="mt-2 flex justify-center"><Button variant="secondary" onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronUp /> : <ChevronDown />}{expanded ? 'Ver menos' : 'Ver todos'}</Button></div>}
  </Reveal>;
}