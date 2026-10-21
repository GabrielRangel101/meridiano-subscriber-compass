import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function MonthlyChanges({ changes }: { changes: DashboardData['changes'] }) {
  const max = Math.max(...changes.map((c) => Math.abs(c.value)), 0.001);
  return <Reveal index={13} className="min-w-0 lg:col-span-6" aria-labelledby="changes-title">
    <h3 id="changes-title" className="font-display text-xl font-medium">Variação mês a mês</h3>
    <p className="mt-1 text-sm text-muted-foreground">Em relação ao mês anterior</p>
    <div className="mt-6 space-y-5">
      {changes.map((c) => {
        const Icon = c.dir === 'up' ? ArrowUpRight : c.dir === 'down' ? ArrowDownRight : ArrowRight;
        const tone = c.good === null ? 'text-muted-foreground' : c.good ? 'text-positive' : 'text-danger';
        const width = Math.abs(c.value) / max * 48;
        return <div key={c.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2"><span className="text-sm capitalize">{c.label} <span className="text-xs text-muted-foreground normal-case">({c.unit})</span></span><span className={cn('flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums', tone)}><Icon className="size-4" aria-hidden />{c.formatted}<span className="sr-only">{c.good === null ? 'neutro' : c.good ? 'favorável' : 'desfavorável'}</span></span></div>
          <svg viewBox="0 0 100 7" className="h-5 w-full" role="img" aria-label={`${c.label}: ${c.formatted}, ${c.good ? 'favorável' : c.good === null ? 'neutro' : 'desfavorável'}`}><rect x={0} y={2} width={100} height={3} rx={1.5} fill="var(--muted)" opacity={0.4} /><line x1={50} x2={50} y1={0} y2={7} stroke="var(--muted-foreground)" strokeWidth={0.25} /><rect x={c.value >= 0 ? 50 : 50 - width} y={2} width={width} height={3} rx={1} fill={c.good === null ? 'var(--cat-6)' : c.good ? 'var(--positive-fill)' : 'var(--danger)'} /></svg>
        </div>;
      })}
    </div>
    <div className="mt-6 flex flex-wrap gap-4 border-t pt-3 text-xs text-muted-foreground"><span className="text-positive">↗ Favorável</span><span className="text-danger">↘ Desfavorável</span></div>
  </Reveal>;
}