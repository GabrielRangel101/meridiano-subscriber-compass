import { motion, useReducedMotion } from "framer-motion";
import { sankey, sankeyJustify, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyLink as D3Link, SankeyNode as D3Node } from "d3-sankey";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Sankey } from "@/engine/metrics";
import { CHANNEL_COLORS, PLAN_COLORS } from "@/lib/dashboard-data";
import { fmtInt, fmtPct } from "@/lib/format";
import { GlassTooltip } from "./ChartTooltip";

interface N {
  id: string;
  label: string;
  group: string;
}
interface L {
  source: string;
  target: string;
  value: number;
}
type LNode = D3Node<N, L>;
type LLink = D3Link<N, L>;

const GROUP_COLOR: Record<string, string> = {
  origem: "var(--primary)",
  positivo: "var(--positive-fill)",
  negativo: "var(--danger)",
  "ponto de contato": "var(--cyan)",
};
const colorOf = (n: N) =>
  n.group === "plano" ? (PLAN_COLORS[n.label] ?? "var(--cat-6)") : n.group === "canal" ? (CHANNEL_COLORS[n.label] ?? "var(--cat-6)") : (GROUP_COLOR[n.group] ?? "var(--cat-6)");

export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(3, max - 1))}…` : s);

/** Sankey genérico: aceita qualquer objeto `Sankey` do motor e ocupa toda a área do contêiner. */
export function SubscriberSankey({ flow, label = "Diagrama de Sankey" }: { flow: Sankey; label?: string }) {
  const [ref, size] = useSize<HTMLDivElement>();
  const width = size.w;
  const reduce = useReducedMotion();
  const height = Math.max(200, size.h);
  const [hoverLink, setHoverLink] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; link: LLink } | null>(null);

  const layout = useMemo(() => {
    if (width < 50) return null;
    const used = new Set(flow.links.flatMap((l) => [l.source, l.target]));
    const nodes: N[] = flow.nodes.filter((n) => used.has(n.id)).map((n) => ({ ...n }));
    const links: L[] = flow.links.filter((l) => l.value > 0).map((l) => ({ ...l }));
    const gen = sankey<N, L>()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(14)
      .nodePadding(height < 320 ? 8 : 12)
      .nodeSort(null)
      .extent([
        [1, 4],
        [width - 1, height - 4],
      ]);
    return gen({ nodes, links });
  }, [flow, width, height]);

  // caminho realçado: link em hover, ou todos os links ligados ao nó em hover
  const activeIdx = useMemo(() => {
    if (!layout) return null;
    if (hoverLink !== null) {
      const l = layout.links[hoverLink];
      const s = (l.source as LNode).id;
      const t = (l.target as LNode).id;
      // inclui o trecho anterior/posterior que passa por nós intermediários
      const isMiddle = (id: string) => layout.links.some((x) => (x.source as LNode).id === id) && layout.links.some((x) => (x.target as LNode).id === id);
      return new Set(
        layout.links
          .map((x, i) => ({ x, i }))
          .filter(({ x, i }) => i === hoverLink || ((x.target as LNode).id === s && isMiddle(s)) || ((x.source as LNode).id === t && isMiddle(t)))
          .map(({ i }) => i),
      );
    }
    if (hoverNode !== null) {
      return new Set(
        layout.links
          .map((x, i) => ({ x, i }))
          .filter(({ x }) => (x.source as LNode).id === hoverNode || (x.target as LNode).id === hoverNode)
          .map(({ i }) => i),
      );
    }
    return null;
  }, [layout, hoverLink, hoverNode]);

  const compact = width < 520;
  const maxChars = compact ? 11 : width < 760 ? 18 : 26;
  const path = sankeyLinkHorizontal();

  return (
    <div ref={ref} className="relative h-full min-h-[200px] w-full">
      {layout && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${label}: ${fmtInt(flow.total)} assinantes no período.`}
          onMouseLeave={() => {
            setHoverLink(null);
            setHoverNode(null);
            setTip(null);
          }}
        >
          <defs>
            {layout.links.map((l, i) => {
              const s = l.source as LNode;
              const t = l.target as LNode;
              return (
                <linearGradient key={i} id={`sk-g-${i}`} gradientUnits="userSpaceOnUse" x1={s.x1} x2={t.x0}>
                  <stop offset="0%" stopColor={colorOf(s)} />
                  <stop offset="100%" stopColor={colorOf(t)} />
                </linearGradient>
              );
            })}
          </defs>
          <g fill="none">
            {layout.links.map((l, i) => {
              const on = activeIdx === null || activeIdx.has(i);
              return (
                <motion.path
                  key={`${(l.source as LNode).id}>${(l.target as LNode).id}`}
                  d={path(l) ?? undefined}
                  stroke={`url(#sk-g-${i})`}
                  strokeWidth={Math.max(1, l.width ?? 1)}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1, strokeOpacity: on ? (activeIdx ? 0.7 : 0.35) : 0.08 }}
                  transition={{ pathLength: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }, strokeOpacity: { duration: 0.2 } }}
                  onMouseEnter={() => setHoverLink(i)}
                  onMouseMove={(e) => {
                    const r = ref.current?.getBoundingClientRect();
                    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, link: l });
                  }}
                  onMouseLeave={() => {
                    setHoverLink(null);
                    setTip(null);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <title>{`${(l.source as LNode).label} → ${(l.target as LNode).label}: ${fmtInt(l.value)}`}</title>
                </motion.path>
              );
            })}
          </g>
          {layout.nodes.map((n) => {
            const x0 = n.x0 ?? 0;
            const x1 = n.x1 ?? 0;
            const y0 = n.y0 ?? 0;
            const y1 = n.y1 ?? 0;
            const right = x0 < width / 2;
            const full = `${n.label}: ${fmtInt(n.value ?? 0)}`;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHoverNode(n.id)}
                onMouseLeave={() => setHoverNode(null)}
                tabIndex={0}
                aria-label={full}
                onFocus={() => setHoverNode(n.id)}
                onBlur={() => setHoverNode(null)}
                style={{ outline: "none" }}
              >
                <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} rx={3} fill={colorOf(n)} />
                {y1 - y0 >= 10 && (
                  <text
                    x={right ? x1 + 6 : x0 - 6}
                    y={(y0 + y1) / 2}
                    dy="0.35em"
                    textAnchor={right ? "start" : "end"}
                    fontSize={compact ? 10 : 11}
                    fill="var(--foreground)"
                    style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, strokeLinejoin: "round" }}
                  >
                    <tspan>{truncate(n.label, maxChars)}</tspan>
                    <tspan dx={4} fill="var(--muted-foreground)" fontWeight={600} className="tabular-nums">
                      {fmtInt(n.value ?? 0)}
                    </tspan>
                    <title>{full}</title>
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {tip && (
        <div className="pointer-events-none absolute z-10" style={{ left: Math.min(tip.x + 12, Math.max(0, width - 220)), top: tip.y + 12 }}>
          <GlassTooltip
            title={`${(tip.link.source as LNode).label} → ${(tip.link.target as LNode).label}`}
            rows={[
              { label: "Assinantes", value: fmtInt(tip.link.value), color: colorOf(tip.link.target as LNode) },
              { label: "% do total", value: fmtPct(flow.total ? tip.link.value / flow.total : 0, 1) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
