import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePeriodData } from "@/lib/dashboard-data";
import type { PeriodN } from "@/lib/dashboard-data";
import { fmtInt } from "@/lib/format";
import { ChannelFunnel } from "./ChannelFunnel";
import { PeriodSelector } from "./PeriodSelector";
import { ReasonsDonut } from "./ReasonsDonut";
import { Reveal } from "./Reveal";
import { SubscriberSankey } from "./SubscriberSankey";

const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
};

export function PeriodSection({ index }: { index: number }) {
  const [n, setN] = useState<PeriodN>(3);
  const p = usePeriodData(n);

  return (
    <section aria-labelledby="period-title" className="flex flex-col gap-4 lg:col-span-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="period-title" className="font-display text-2xl font-medium text-foreground">
            Fluxo, motivos e conversão
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">{p.rangeLabel}</p>
        </div>
        <PeriodSelector value={n} onChange={setN} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal index={index} className="min-w-0 lg:col-span-8" aria-labelledby="sankey-title">
          <AnimatePresence mode="wait">
            <motion.div key={n} {...fade}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="sankey-title" className="font-display text-xl font-medium text-foreground">
                  Fluxo de assinantes
                </h3>
                <span className="text-sm tabular-nums text-muted-foreground">
                  <strong className="text-foreground">{fmtInt(p.flow.total)}</strong> assinantes no período
                </span>
              </div>
              <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                <span className="text-danger">{fmtInt(p.flowSummary.cancelled)} cancelaram</span> ·{" "}
                <span className="text-positive">{fmtInt(p.flowSummary.upgrades)} upgrades</span> ·{" "}
                <span className="text-foreground">{fmtInt(p.flowSummary.stayed)} permanecem</span>
              </p>
              <div className="mt-4">
                <SubscriberSankey flow={p.flow} />
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal id="reasons-card" index={index + 1} className="min-w-0 lg:col-span-4" aria-labelledby="reasons-title">
          <h3 id="reasons-title" className="font-display text-xl font-medium text-foreground">
            Motivos de cancelamento
          </h3>
          <p className="mb-2 text-sm text-muted-foreground">Natureza (anel interno) e motivo (externo)</p>
          <AnimatePresence mode="wait">
            <motion.div key={n} {...fade}>
              <ReasonsDonut reasons={p.reasons} />
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal id="funnel-card" index={index + 2} className="min-w-0 lg:col-span-12" aria-labelledby="funnel-title">
          <h3 id="funnel-title" className="font-display text-xl font-medium text-foreground">
            Funil por canal
          </h3>
          <p className="text-sm text-muted-foreground">Visualizações de paywall → inícios de checkout → compras</p>
          <AnimatePresence mode="wait">
            <motion.div key={n} {...fade} className="mt-2">
              <ChannelFunnel rows={p.funnel} best={p.bestChannel} worst={p.worstChannel} />
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
