import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { generateDataset } from "@/engine/generate";
import { buildSeries } from "@/engine/metrics";
import { generateInsights } from "@/engine/insights";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gazeta Meridiano · Subscription Intelligence" },
      { name: "description", content: "Analytics de assinaturas digitais da Gazeta Meridiano (dados sintéticos)." },
      { property: "og:title", content: "Gazeta Meridiano · Subscription Intelligence" },
      { property: "og:description", content: "Analytics de assinaturas digitais da Gazeta Meridiano (dados sintéticos)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const { ds, last, insights } = useMemo(() => {
    const ds = generateDataset();
    const series = buildSeries(ds);
    return { ds, last: series[series.length - 1], insights: generateInsights(ds) };
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-muted-foreground">Subscription Intelligence · validação do motor</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">{ds.meta.brand}</h1>
      <p className="mt-4 text-foreground">
        {last.label}: <strong>{last.active.toLocaleString("pt-BR")}</strong> ativos · churn{" "}
        <strong>{(last.churnRate * 100).toFixed(1).replace(".", ",")}%</strong> · MRR{" "}
        <strong>{last.mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
      </p>
      <h2 className="mt-8 text-lg font-semibold text-foreground">Principais insights</h2>
      <ul className="mt-3 space-y-3">
        {insights.slice(0, 3).map((i) => (
          <li key={i.id} className="rounded-md border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.severity}</p>
            <p className="mt-1 font-medium text-foreground">{i.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{i.text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
