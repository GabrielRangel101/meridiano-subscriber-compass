import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function InfoTip({ text, label = "Mais informações" }: { text: ReactNode; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
          <Info className="size-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

/** Botão "✦" de perguntar à IA sobre o card — ação chega na 3C-2. */
export function AskButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      aria-label={`Perguntar ao Modo IA sobre ${title} (em breve)`}
      title="Perguntar ao Modo IA (em breve)"
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
    >
      ✦
    </button>
  );
}

export function SectionLabel({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h2>
  );
}

/** Card denso do dashboard: cabeçalho de uma linha + corpo que ocupa a área útil. */
export function DashCard({
  id,
  title,
  info,
  summary,
  actions,
  className,
  bodyClassName,
  children,
}: {
  id?: string;
  title: string;
  info?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const hid = useId();
  return (
    <section id={id} aria-labelledby={hid} className={cn("dash-card flex min-h-0 min-w-0 flex-col gap-2 p-3", className)}>
      <header className="flex min-h-6 shrink-0 items-center gap-1.5">
        <SectionLabel id={hid}>{title}</SectionLabel>
        {info && <InfoTip text={info} label={`Sobre: ${title}`} />}
        <div className="ml-auto flex min-w-0 items-center gap-2">
          {summary && <span className="min-w-0 truncate text-xs tabular-nums text-muted-foreground">{summary}</span>}
          {actions}
          <AskButton title={title} />
        </div>
      </header>
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Seletor segmentado compacto para ações de cabeçalho. */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-md border bg-background/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
            o.value === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
