import { motion } from "framer-motion";
import type { FunnelRow } from "@/engine/metrics";
import { CHANNEL_COLORS } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashCard } from "./DashCard";

const STAGES = [
  { key: "paywallViews", label: "Paywall", opacity: 0.45 },
  { key: "checkoutStarts", label: "Checkout", opacity: 0.7 },
  { key: "purchases", label: "Compras", opacity: 1 },
] as const;

const ROW = "grid grid-cols-3 items-center gap-x-3 gap-y-1 md:grid-cols-[11rem_repeat(3,minmax(0,1fr))_6rem]";

export function FunnelCard({ rows, best, worst, rangeLabel, className }: { rows: FunnelRow[]; best: string | null; worst: string | null; rangeLabel: string; className?: string }) {
  return (
    <DashCard id="funnel-card" title="Funil por canal" info={`Visualizações de paywall → inícios de checkout → compras · ${rangeLabel}. Compras são reais do dataset; etapas anteriores estimadas pelas taxas de conversão do canal.`} summary={rangeLabel} className={className}>
      <ChannelFunnel rows={rows} best={best} worst={worst} />
    </DashCard>
  );
}

export function ChannelFunnel({ rows, best, worst }: { rows: FunnelRow[]; best: string | null; worst: string | null }) {
  const max = Object.fromEntries(STAGES.map((s) => [s.key, Math.max(1, ...rows.map((r) => r[s.key]))]));
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(ROW, "hidden shrink-0 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground md:grid")} aria-hidden>
        <span>Canal</span>
        {STAGES.map((s) => <span key={s.key}>{s.label}</span>)}
        <span className="text-right">Conversão</span>
      </div>
      <ul className="min-h-0 flex-1 divide-y overflow-y-auto" aria-label="Funil de conversão por canal">
        {rows.map((r, idx) => (
          <li key={r.channel} className={cn(ROW, "py-1.5 md:h-10 md:py-0")}>
            <span className="col-span-2 flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground md:col-span-1">
              <span className="size-2 shrink-0 rounded-full" style={{ background: CHANNEL_COLORS[r.channel] ?? "var(--cat-6)" }} aria-hidden />
              <span className="truncate">{r.channel}</span>
              {r.channel === best && <span className="shrink-0 text-[10px] font-semibold text-warning" title="maior conversão">★</span>}
              {r.channel === worst && <span className="shrink-0 text-[10px] font-semibold text-danger" title="menor conversão">▼</span>}
            </span>
            {STAGES.map((s, i) => {
              const v = r[s.key];
              const rate = i === 1 ? r.paywallToCheckout : i === 2 ? r.checkoutToPurchase : null;
              return (
                <div key={s.key} className="flex min-w-0 items-center gap-2 text-[11px]" aria-label={`${s.label}: ${fmtInt(v)}`}>
                  <div className="relative h-2 min-w-6 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div className="bg-gradient-primary h-full rounded-full" style={{ opacity: s.opacity }} initial={{ width: 0 }} animate={{ width: `${Math.max(2, (v / max[s.key]) * 100)}%` }} transition={{ duration: 0.6, delay: idx * 0.03 + i * 0.06, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                  <span className="shrink-0 text-right tabular-nums text-foreground">
                    {fmtInt(v)}
                    {rate !== null && <span className="ml-1 hidden text-muted-foreground lg:inline">{fmtPct(rate, 1)}</span>}
                  </span>
                </div>
              );
            })}
            <span className={cn("col-start-3 row-start-1 text-right text-sm font-semibold tabular-nums md:col-start-auto md:row-start-auto", r.channel === best ? "text-warning" : r.channel === worst ? "text-danger" : "text-foreground")}>
              {fmtPct(r.overall, 2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
