import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiCardContent } from "./AiCardContent";
import { INITIAL_SUGGESTIONS, type Exchange } from "./session";
interface Path { id: string; d: string }
export function AiCanvas({ items, busy, reduced, mobile, onAsk, onHide }: { items: Exchange[]; busy: boolean; reduced: boolean; mobile: boolean; onAsk: (q: string) => void; onHide: (id: number, card: string) => void }) {
  const canvas = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLElement | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const measure = useCallback(() => {
    const el = canvas.current;
    if (!el || mobile) { setPaths([]); return; }
    const box = el.getBoundingClientRect();
    const result: Path[] = [];
    el.querySelectorAll<HTMLElement>("[data-group]").forEach(group => {
      const node = group.querySelector<HTMLElement>("[data-node]");
      if (!node) return;
      const nr = node.getBoundingClientRect();
      const x = nr.left + nr.width / 2 - box.left, y = nr.bottom - box.top;
      group.querySelectorAll<HTMLElement>("[data-card]").forEach(card => {
        const cr = card.getBoundingClientRect();
        const tx = cr.left + cr.width / 2 - box.left, ty = cr.top - box.top;
        result.push({ id: `${group.dataset['group']}-${card.dataset['card']}`, d: `M ${x} ${y} C ${x} ${y + 48}, ${tx} ${ty - 48}, ${tx} ${ty}` });
      });
    });
    setPaths(result);
  }, [mobile]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll("[data-card]").forEach(card => observer.observe(card));
    const timer = window.setTimeout(measure, reduced ? 0 : 800);
    last.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [items, measure, reduced]);
  return <div className="ai-canvas-scroll"><div ref={canvas} className="ai-canvas">
    {!mobile && <svg className="ai-connections" aria-hidden><defs><linearGradient id="ai-thread"><stop stopColor="var(--cat-1)" /><stop offset="1" stopColor="var(--cat-4)" /></linearGradient></defs>{paths.map(path => <g key={path.id}><path d={path.d} stroke="url(#ai-thread)" strokeWidth="1.5" fill="none" opacity=".4" />{!reduced && <path className="ai-path-pulse" d={path.d} stroke="var(--cat-4)" strokeWidth="2" fill="none" strokeDasharray="8 120" />}</g>)}</svg>}
    {!items.length && <div className="ai-welcome"><Sparkles className="ai-welcome-icon" aria-hidden /><h2 className="font-display">Pergunte algo sobre as assinaturas</h2><div className="ai-suggestions">{INITIAL_SUGGESTIONS.map(q => <Button variant="secondary" key={q} className="ai-chip" onClick={() => onAsk(q)}>{q}</Button>)}</div></div>}
    <AnimatePresence>{items.map((item, index) => <motion.section data-group={item.id} key={item.id} ref={el => { if (index === items.length - 1) last.current = el; }} className="ai-group" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: index === items.length - 1 ? 1 : .35, scale: index === items.length - 1 ? 1 : .96 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }}>
      <div data-node className="ai-question"><Sparkles aria-hidden className="size-4" /><h2>{item.question}</h2></div>
      {!item.answer && busy && <div role="status" className="ai-analyzing">analisando… <span className="ai-dots" aria-hidden><i /><i /><i /></span></div>}
      <div className="ai-card-grid"><AnimatePresence>{item.answer?.cards.filter(card => !item.hidden.includes(card.id)).map((card, i) => <motion.article key={card.id} data-card={card.id} aria-label={card.title} className="ai-data-card" drag={!mobile} dragConstraints={canvas} dragMomentum={false} dragElastic={0} onDrag={measure} onDragEnd={measure} initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : .92 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24, delay: i * .12 }} whileHover={reduced || mobile ? undefined : { boxShadow: "var(--ai-shadow-hover)" }}>
        <header className="ai-card-header"><div><h3 className="font-display">{card.title}</h3>{"subtitle" in card && card.subtitle && <p>{card.subtitle}</p>}</div><div className="flex shrink-0 items-center gap-1">{!mobile && <GripVertical className="size-4 text-muted-foreground" aria-hidden />}<Button variant="ghost" size="icon" aria-label={`Fechar ${card.title}`} title={`Fechar ${card.title}`} onPointerDown={e => e.stopPropagation()} onClick={() => onHide(item.id, card.id)}><X /></Button></div></header>
        <AiCardContent card={card} />
      </motion.article>)}</AnimatePresence></div>
    </motion.section>)}</AnimatePresence>
  </div></div>;
}
