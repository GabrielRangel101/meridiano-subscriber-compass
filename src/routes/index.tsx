import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { generateDataset } from "@/engine/generate";
import { monthLabel } from "@/engine/calendar";

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
  const ds = useMemo(() => generateDataset(), []);
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-muted-foreground">Subscription Intelligence · fase 1</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">{ds.meta.brand}</h1>
      <p className="mt-4 text-foreground">
        Total de assinantes no dataset:{" "}
        <strong>{ds.subscribers.length.toLocaleString("pt-BR")}</strong>
      </p>
      <h2 className="mt-8 text-lg font-semibold text-foreground">Eventos</h2>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border">
        {ds.meta.events.map((e) => (
          <li key={e.label} className="flex justify-between px-4 py-2 text-sm">
            <span className="text-foreground">{e.label}</span>
            <span className="text-muted-foreground">{monthLabel(e.month)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
