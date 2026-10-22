import { Link } from "@tanstack/react-router";
import type { DashboardData } from "@/lib/dashboard-data";
import { INSIGHT_TARGETS, INSIGHT_VIEWS } from "@/lib/dashboard-data";
import { useGoToCard } from "@/components/shell/use-go-to-card";
import { cn } from "@/lib/utils";
import { DashCard } from "./DashCard";
import { SEVERITY_TONES } from "./RuleInsights";

export function InsightsCompact({ data, className }: { data: DashboardData; className?: string }) {
  const goTo = useGoToCard();
  return (
    <DashCard
      title="Insights"
      info="Quatro principais achados do motor de regras. Clique para abrir o card relacionado."
      actions={<Link to="/" search={{ view: "risco" }} className="text-[11px] font-medium text-primary hover:underline">ver todos</Link>}
      className={className}
    >
      <ul className="flex min-h-0 flex-1 flex-col justify-around gap-1">
        {data.insights.slice(0, 4).map((i) => (
          <li key={i.id} className="min-w-0">
            <button type="button" onClick={() => goTo(INSIGHT_VIEWS[i.topic], INSIGHT_TARGETS[i.topic])} className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-secondary/60" title={i.text}>
              <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize", SEVERITY_TONES[i.severity])}>{i.severity}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-foreground">{i.title}</span>
              {i.displayValue && <strong className="shrink-0 text-xs tabular-nums text-foreground">{i.displayValue}</strong>}
            </button>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
