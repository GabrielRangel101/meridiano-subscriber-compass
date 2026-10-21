import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAiAnswer } from "@/lib/dashboard-data";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { AiCanvas } from "./AiCanvas";
import { AiConversation } from "./AiConversation";
import { appendVisible, type Exchange } from "./session";
export function AiMode() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [items, setItems] = useState<Exchange[]>([]);
  const [history, setHistory] = useState<Exchange[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const job = useRef(0);
  const reduced = useMotionPreference();
  useEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update(); mq.addEventListener("change", update);
    return () => { mq.removeEventListener("change", update); job.current++; };
  }, []);
  function ask(question: string) {
    if (busy || !question.trim()) return;
    const id = ++job.current;
    const entry: Exchange = { id, question: question.trim(), hidden: [] };
    setBusy(true); setError("");
    setItems(prev => appendVisible(prev, entry));
    setHistory(prev => [...prev, entry].slice(-20));
    const start = performance.now();
    const run = () => {
      if (job.current !== id) return;
      try {
        const result = getAiAnswer(entry.question);
        window.setTimeout(() => {
          if (job.current !== id) return;
          const complete = (prev: Exchange[]) => prev.map(item => item.id === id ? { ...item, answer: result } : item);
          setItems(complete); setHistory(complete); setBusy(false);
        }, Math.max(0, 700 - (performance.now() - start)));
      } catch {
        setError("Não foi possível concluir a análise. Tente outra pergunta."); setBusy(false);
      }
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 100 });
    else window.setTimeout(run, 0);
  }
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><Button className="bg-gradient-primary rounded-full px-5 py-2.5 h-auto self-start sm:self-auto"><Sparkles aria-hidden />Modo IA</Button></Dialog.Trigger>
    <AnimatePresence>{open && <Dialog.Portal forceMount><Dialog.Overlay forceMount asChild><motion.div className="ai-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .5 }} /></Dialog.Overlay>
      <Dialog.Content forceMount asChild onOpenAutoFocus={e => { e.preventDefault(); document.getElementById("ai-question-input")?.focus({ preventScroll: true }); }} aria-describedby="ai-privacy"><motion.div className="ai-mode" initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : .96 }} transition={{ duration: reduced ? 0 : .5 }}>
        <header className="ai-topbar"><div><Dialog.Title className="font-display ai-title"><Sparkles aria-hidden />Modo IA</Dialog.Title><Dialog.Description id="ai-privacy" className="ai-privacy"><ShieldCheck className="size-3.5" aria-hidden />Roda 100% no navegador · nenhuma chamada externa · dados sintéticos</Dialog.Description></div><div className="ai-top-actions"><Button variant="ghost" size="icon" title="Limpar canvas" aria-label="Limpar canvas" onClick={() => { job.current++; setItems([]); setHistory([]); setBusy(false); setError(""); }}><Trash2 /></Button><Dialog.Close asChild><Button variant="secondary" className="ai-exit"><LogOut /><span>Sair do Modo IA</span></Button></Dialog.Close></div></header>
        {error && <p role="alert" className="ai-error">{error}</p>}
        <AiCanvas items={items} busy={busy} reduced={reduced} mobile={mobile} onAsk={ask} onHide={(id, card) => setItems(prev => prev.map(item => item.id === id ? { ...item, hidden: [...item.hidden, card] } : item))} />
        <AiConversation history={history} busy={busy} reduced={reduced} onAsk={ask} />
      </motion.div></Dialog.Content>
    </Dialog.Portal>}</AnimatePresence>
  </Dialog.Root>;
}
