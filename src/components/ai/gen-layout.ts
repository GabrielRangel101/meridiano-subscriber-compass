// Geometria pura (apresentação): posiciona cards gerados em slots livres ao redor do foco.
export interface Rect { x: number; y: number; w: number; h: number }
export const GEN_W = 300;
export const GEN_H = 236;
const GAP = 14;

const overlaps = (a: Rect, b: Rect, pad = 12) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/** Slots determinísticos dentro de `region`, sem tocar `avoid`, ordenados pela distância ao foco. */
export function layoutSlots(region: Rect, avoid: Rect[], focus: Rect, count: number): Rect[] {
  const cols = Math.max(1, Math.floor((region.w + GAP) / (GEN_W + GAP)));
  const rows = Math.max(1, Math.floor((region.h + GAP) / (GEN_H + GAP)));
  const ox = region.x + (region.w - (cols * (GEN_W + GAP) - GAP)) / 2;
  const slots: Rect[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const s = { x: ox + c * (GEN_W + GAP), y: region.y + r * (GEN_H + GAP), w: GEN_W, h: GEN_H };
      if (!avoid.some((a) => overlaps(s, a))) slots.push(s);
    }
  const fx = focus.x + focus.w / 2, fy = focus.y + focus.h / 2;
  const d = (s: Rect) => Math.hypot(s.x + s.w / 2 - fx, s.y + s.h / 2 - fy);
  return slots.sort((a, b) => d(a) - d(b) || a.y - b.y || a.x - b.x).slice(0, count);
}

/** Bezier da borda do foco até a borda do card. */
export function threadPath(from: Rect, to: Rect): { d: string; a: [number, number]; b: [number, number] } {
  const fc = [from.x + from.w / 2, from.y + from.h / 2], tc = [to.x + to.w / 2, to.y + to.h / 2];
  const dx = tc[0] - fc[0], dy = tc[1] - fc[1];
  let a: [number, number], b: [number, number], c1: [number, number], c2: [number, number];
  if (Math.abs(dx) * from.h > Math.abs(dy) * from.w) {
    const sx = dx > 0 ? 1 : -1;
    a = [sx > 0 ? from.x + from.w : from.x, fc[1]];
    b = [sx > 0 ? to.x : to.x + to.w, tc[1]];
    const k = Math.max(40, Math.abs(b[0] - a[0]) / 2) * sx;
    c1 = [a[0] + k, a[1]]; c2 = [b[0] - k, b[1]];
  } else {
    const sy = dy > 0 ? 1 : -1;
    a = [fc[0], sy > 0 ? from.y + from.h : from.y];
    b = [tc[0], sy > 0 ? to.y : to.y + to.h];
    const k = Math.max(40, Math.abs(b[1] - a[1]) / 2) * sy;
    c1 = [a[0], a[1] + k]; c2 = [b[0], b[1] - k];
  }
  return { d: `M ${a[0]} ${a[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${b[0]} ${b[1]}`, a, b };
}
