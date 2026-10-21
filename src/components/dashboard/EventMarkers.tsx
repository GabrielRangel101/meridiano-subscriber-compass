import { ReferenceLine } from "recharts";
import type { EventMarker } from "@/engine/types";

const KIND_COLOR: Record<EventMarker["kind"], string> = {
  campanha: "var(--cat-5)",
  "preço": "var(--danger)",
  evento: "var(--cat-4)",
};
const KIND_GLYPH: Record<EventMarker["kind"], string> = { campanha: "%", "preço": "R$", evento: "★" };

interface MarkerLabelProps {
  viewBox?: { x: number; y: number; height: number };
  event: EventMarker;
  onHover: (e: EventMarker | null, x?: number) => void;
}

function MarkerLabel({ viewBox, event, onHover }: MarkerLabelProps) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const color = KIND_COLOR[event.kind];
  return (
    <g
      transform={`translate(${x}, ${y + 2})`}
      tabIndex={0}
      role="button"
      aria-label={`${event.label}: ${event.description}`}
      onMouseEnter={() => onHover(event, x)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(event, x)}
      onBlur={() => onHover(null)}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <circle r={9} fill="var(--background)" stroke={color} strokeWidth={1.75} />
      <text textAnchor="middle" dy={3.5} fontSize={event.kind === "preço" ? 7 : 9} fontWeight={600} fill={color}>
        {KIND_GLYPH[event.kind]}
      </text>
      <title>{`${event.label} — ${event.description}`}</title>
    </g>
  );
}

/**
 * Retorna elementos ReferenceLine (chamar como função dentro do gráfico Recharts,
 * pois o Recharts só reconhece filhos diretos do tipo ReferenceLine).
 */
export function eventMarkers(
  events: EventMarker[],
  xFor: (month: number) => string,
  onHover: (e: EventMarker | null, x?: number) => void,
) {
  return events.map((e) => (
    <ReferenceLine
      key={`${e.label}-${e.month}`}
      x={xFor(e.month)}
      stroke={KIND_COLOR[e.kind]}
      strokeOpacity={0.35}
      strokeDasharray="2 4"
      ifOverflow="extendDomain"
      label={<MarkerLabel event={e} onHover={onHover} />}
    />
  ));
}

export function EventPopover({ event, x }: { event: EventMarker | null; x: number }) {
  if (!event) return null;
  return (
    <div
      className="glass pointer-events-none absolute top-8 z-10 w-60 -translate-x-1/2 rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ left: Math.max(130, x) }}
      role="status"
    >
      <p className="font-display text-sm font-medium text-foreground">{event.label}</p>
      <p className="mt-0.5 text-muted-foreground">{event.description}</p>
    </div>
  );
}

export function EventLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground" aria-label="Legenda dos marcadores de evento">
      {(Object.keys(KIND_COLOR) as EventMarker["kind"][]).map((k) => (
        <li key={k} className="inline-flex items-center gap-1">
          <span
            className="inline-flex size-4 items-center justify-center rounded-full border text-[8px] font-semibold"
            style={{ borderColor: KIND_COLOR[k], color: KIND_COLOR[k] }}
            aria-hidden
          >
            {KIND_GLYPH[k]}
          </span>
          {k}
        </li>
      ))}
    </ul>
  );
}
