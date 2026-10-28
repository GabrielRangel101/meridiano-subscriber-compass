import type { UnitRow } from "@/engine/growth";
import { CHANNEL_COLORS, WINDOW_LABEL } from "@/lib/dashboard-data";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashCard } from "./DashCard";

const TONE: Record<string, string> = {
  bom: "bg-positive/15 text-positive border-positive/30",
  medio: "bg-warning/15 text-warning border-warning/30",
  ruim: "bg-danger/15 text-danger border-danger/30",
};
const BAR: Record<string, string> = { bom: "var(--positive-fill)", medio: "var(--cat-3)", ruim: "var(--danger)" };

const COLS = "grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.5fr)_minmax(0,0.7fr)]";

/** Eficiência por canal: volume, CAC, retenção, LTV de 12 meses, LTV/CAC e payback. */
export function UnitEconomics({ rows, className }: { rows: UnitRow[]; className?: string }) {
  const maxNew = Math.max(1, ...rows.map((r) => r.newSubs));
  const maxRatio = Math.max(3, ...rows.map((r) => r.ltvCac ?? 0));
  return (
    <DashCard
      id="acq-quality-card"
      ai="acq-quality"
      title="Eficiência por canal · LTV × CAC"
      info="LTV 12m = ticket médio realizado × soma da sobrevivência (Kaplan-Meier) nos 12 primeiros meses. CAC é uma premissa sintética por canal (o dataset não tem custo de mídia). LTV/CAC: ≥ 3 bom, 1,5–3 atenção, < 1,5 ruim. Payback = meses de ticket para recuperar o CAC."
      summary={`novas assinaturas ${WINDOW_LABEL} · CAC = premissa`}
      className={className}
    >
      <UnitCards rows={rows} maxRatio={maxRatio} />
      <div className={cn("hidden shrink-0 gap-2 pb-1 text-[0.625rem] uppercase tracking-wider text-muted-foreground md:grid", COLS)}>
        <span>Canal</span>
        <span>Novas</span>
        <span className="text-right">CAC</span>
        <span className="text-right">Ret. 6m</span>
        <span className="text-right">LTV 12m</span>
        <span>LTV / CAC</span>
        <span className="text-right">Payback</span>
      </div>
      <ul className="hidden min-h-0 flex-1 flex-col justify-around divide-y overflow-y-auto md:flex">
        {rows.map((r) => (
          <li key={r.channel} className={cn("grid flex-1 items-center gap-2 text-xs", COLS)}>
            <span className="flex min-w-0 items-center gap-1.5 text-foreground">
              <span className="size-2 shrink-0 rounded-full" style={{ background: CHANNEL_COLORS[r.channel] ?? "var(--cat-6)" }} aria-hidden />
              <span className="truncate" title={r.channel}>{r.channel}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted/40">
                <span className="block h-full rounded-sm" style={{ width: `${(r.newSubs / maxNew) * 100}%`, background: CHANNEL_COLORS[r.channel] ?? "var(--cat-6)" }} />
              </span>
              <span className="w-9 shrink-0 text-right font-medium tabular-nums text-foreground">{fmtInt(r.newSubs)}</span>
            </span>
            <span className="text-right tabular-nums text-foreground">{fmtBRL(r.cac, 0)}</span>
            <span className="text-right tabular-nums text-muted-foreground">{r.retention6 === null ? "—" : fmtPct(r.retention6, 0)}</span>
            <span className="text-right tabular-nums text-foreground">{r.ltv12 === null ? "—" : fmtBRL(r.ltv12, 0)}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted/40">
                <span className="block h-full rounded-sm" style={{ width: `${r.ltvCac === null ? 0 : Math.min(100, (r.ltvCac / maxRatio) * 100)}%`, background: r.tone ? BAR[r.tone] : "var(--cat-6)" }} />
              </span>
              <span className={cn("w-12 shrink-0 rounded-full border px-1.5 py-0.5 text-center text-[0.6875rem] font-semibold tabular-nums", r.tone ? TONE[r.tone] : "border-border text-muted-foreground")}>
                {r.ltvCac === null ? "—" : `${r.ltvCac.toFixed(1).replace(".", ",")}x`}
              </span>
            </span>
            <span className="text-right tabular-nums text-muted-foreground">{r.payback === null ? "—" : `${r.payback.toFixed(1).replace(".", ",")} m`}</span>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}

/** Celular: um cartão por canal (nome + barra e selo de LTV/CAC, depois as 5 métricas em grade). */
function UnitCards({ rows, maxRatio }: { rows: UnitRow[]; maxRatio: number }) {
  const stat = (label: string, value: string) => (
    <div className="min-w-0 text-center">
      <div className="text-xs font-medium tabular-nums text-foreground">{value}</div>
      <div className="mt-0.5 text-[0.625rem] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
  return (
    <ul className="divide-y md:hidden" aria-label="Eficiência por canal">
      {rows.map((r) => (
        <li key={r.channel} className="py-2">
          <div className="mb-1.5 flex items-center gap-2 text-xs text-foreground">
            <span className="size-2 shrink-0 rounded-full" style={{ background: CHANNEL_COLORS[r.channel] ?? "var(--cat-6)" }} aria-hidden />
            <span className="min-w-0 flex-1 font-medium">{r.channel}</span>
            <span className="h-2 w-16 shrink-0 overflow-hidden rounded-sm bg-muted/40" aria-hidden>
              <span className="block h-full rounded-sm" style={{ width: `${r.ltvCac === null ? 0 : Math.min(100, (r.ltvCac / maxRatio) * 100)}%`, background: r.tone ? BAR[r.tone] : "var(--cat-6)" }} />
            </span>
            <span className={cn("w-12 shrink-0 rounded-full border px-1.5 py-0.5 text-center text-[0.6875rem] font-semibold tabular-nums", r.tone ? TONE[r.tone] : "border-border text-muted-foreground")}>
              {r.ltvCac === null ? "—" : `${r.ltvCac.toFixed(1).replace(".", ",")}x`}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {stat("novas", fmtInt(r.newSubs))}
            {stat("CAC", fmtBRL(r.cac, 0))}
            {stat("ret. 6m", r.retention6 === null ? "—" : fmtPct(r.retention6, 0))}
            {stat("LTV 12m", r.ltv12 === null ? "—" : fmtBRL(r.ltv12, 0))}
            {stat("payback", r.payback === null ? "—" : `${r.payback.toFixed(1).replace(".", ",")} m`)}
          </div>
        </li>
      ))}
    </ul>
  );
}
