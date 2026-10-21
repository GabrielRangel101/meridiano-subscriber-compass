import { X } from "lucide-react";
import type { AtRiskRow } from "@/engine/metrics";
import { Button } from "@/components/ui/button";
import { DRIVER_COLORS } from "@/lib/dashboard-data";
import { fmtBRL, fmtInt } from "@/lib/format";

export function SubscriberDetail({ person, onClose, compact = false }: { person: AtRiskRow; onClose?: () => void; compact?: boolean }) {
  return <div className={compact ? 'glass max-w-full p-3 text-xs' : 'h-full border-t pt-4 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0'} aria-label={compact ? `Resumo de ${person.name}` : 'Detalhe do assinante'}>
    <div className="flex items-start justify-between gap-2"><h4 className="font-display text-lg font-medium">{person.name}</h4>{onClose && <Button size="icon" variant="ghost" aria-label="Fechar detalhe" onClick={onClose}><X /></Button>}</div>
    <p className="mb-4 text-xs font-medium" style={{ color: DRIVER_COLORS[person.driver] }}>{person.driver}</p>
    <dl className={compact ? 'grid grid-cols-2 gap-x-4 gap-y-2' : 'grid grid-cols-2 gap-x-3 gap-y-4 text-sm'}>
      {[
        ['Plano', person.plan], ['Canal', person.channel], ['Editoria', person.interest], ['Tempo de casa', `${fmtInt(person.tenureMonths)} meses`], ['Engajamento', `${fmtInt(person.engagement)} / 100`], ['Risco em 90 dias', `${String(person.risk).replace('.', ',')}%`], ['MRR', fmtBRL(person.mrr)], ['Gatilho', person.driver],
      ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 break-words font-medium">{value}</dd></div>)}
    </dl>
  </div>;
}