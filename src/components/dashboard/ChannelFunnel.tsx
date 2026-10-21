import { motion } from "framer-motion";
import type { FunnelRow } from "@/engine/metrics";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "paywallViews", label: "Paywall", opacity: 0.45 },
  { key: "checkoutStarts", label: "Checkout", opacity: 0.7 },
  { key: "purchases", label: "Compras", opacity: 1 },
] as const;

export function ChannelFunnel({ rows, best, worst }: { rows: FunnelRow[]; best: string | null; worst: string | null }) {
  return (
    <ul className="divide-y" aria-label="Funil de conversão por canal">
      {rows.map((r, idx) => (
        <li key={r.channel} className="grid grid-cols-1 gap-3 py-3 md:grid-cols-[12rem_1fr_9rem] md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{r.channel}</span>
            {r.channel === best && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-warning">★ maior conversão</span>
            )}
            {r.channel === worst && (
              <span className="rounded-full bg-cat-5/15 px-2 py-0.5 text-[10px] font-semibold text-danger">▼ menor conversão</span>
            )}
          </div>

          <div className="space-y-1" role="img" aria-label={`${r.channel}: ${fmtInt(r.paywallViews)} visualizações de paywall, ${fmtInt(r.checkoutStarts)} checkouts, ${fmtInt(r.purchases)} compras.`}>
            {STAGES.map((s, i) => {
              const v = r[s.key];
              const pct = r.paywallViews ? (v / r.paywallViews) * 100 : 0;
              const rate = i === 1 ? r.paywallToCheckout : i === 2 ? r.checkoutToPurchase : null;
              return (
                <div key={s.key} className="flex items-center gap-2 text-[11px]">
                  <span className="w-16 shrink-0 text-muted-foreground">{s.label}</span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      className="bg-gradient-primary h-full rounded-full"
                      style={{ opacity: s.opacity }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(1.5, pct)}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.04 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right tabular-nums text-foreground">
                    {fmtInt(v)}
                    {rate !== null && <span className="ml-1 text-muted-foreground">({fmtPct(rate, 1)})</span>}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-0">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Conversão total</span>
            <span
              className={cn(
                "font-display text-2xl font-medium tabular-nums",
                r.channel === best ? "text-warning" : r.channel === worst ? "text-danger" : "text-foreground",
              )}
            >
              {fmtPct(r.overall, 2)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
