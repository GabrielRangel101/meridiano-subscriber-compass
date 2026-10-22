import { motion, useReducedMotion } from "framer-motion";
import type { WindowData } from "@/lib/dashboard-data";
import { CHANNEL_COLORS, WINDOW_LABEL } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashCard } from "./DashCard";

const TONE: Record<string, string> = {
  bom: "bg-positive/15 text-positive border-positive/30",
  medio: "bg-warning/15 text-warning border-warning/30",
  ruim: "bg-danger/15 text-danger border-danger/30",
};

/** Uma linha por canal: barra de volume (novas assinaturas) + pílula de retenção em 6 meses. */
export function VolumeQuality({ rows, className }: { rows: WindowData["quality"]; className?: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...rows.map((r) => r.purchases));
  return (
    <DashCard
      id="acq-quality-card"
      ai="acq-quality"
      title="Volume × qualidade por canal"
      info="Barra: novas assinaturas no período. Pílula: % de quem entrou pelo canal que continua assinante após 6 meses (≥ 80% bom, 60–80% atenção, < 60% ruim)."
      summary={`barra = volume · pílula = % que continua assinante após 6 meses · ${WINDOW_LABEL}`}
      className={className}
    >
      <ul className="flex min-h-0 flex-1 flex-col justify-around gap-1 overflow-y-auto">
        {rows.map((r, i) => (
          <li key={r.channel} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.25rem] items-center gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_4.5rem]">
            <span className="truncate text-xs text-foreground" title={r.channel}>{r.channel}</span>
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted/40">
                <motion.div
                  className="h-full rounded-sm"
                  style={{ background: CHANNEL_COLORS[r.channel] ?? "var(--cat-6)", transformOrigin: "left" }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(r.purchases / max) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">{fmtInt(r.purchases)}</span>
            </div>
            <span
              className={cn("justify-self-end rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums", r.tone ? TONE[r.tone] : "border-border text-muted-foreground")}
              aria-label={r.retention6 === null ? `${r.channel}: retenção em 6 meses sem dado` : `${r.channel}: ${fmtPct(r.retention6, 0)} continuam após 6 meses`}
            >
              {r.retention6 === null ? "—" : fmtPct(r.retention6, 0)}
            </span>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
