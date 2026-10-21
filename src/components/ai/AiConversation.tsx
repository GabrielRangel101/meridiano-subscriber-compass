import { useEffect, useState } from "react";
import { ArrowUp, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exchange } from "./session";
export function AiConversation({ history, busy, reduced, onAsk }: { history: Exchange[]; busy: boolean; reduced: boolean; onAsk: (q: string) => void }) {
  const [question, setQuestion] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [count, setCount] = useState(0);
  const latest = history.at(-1);
  const reply = latest?.answer;
  useEffect(() => {
    setCount(0);
    if (!reply || reduced) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const next = Math.floor((performance.now() - start) * .6);
      setCount(next);
      if (next >= reply.text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [reply, reduced]);
  return <footer className="ai-conversation">
    <div className="ai-chat-heading"><span className="font-display">Conversa</span><Button variant="ghost" size="icon" aria-label={expanded ? "Recolher conversa" : "Expandir conversa"} onClick={() => setExpanded(v => !v)}>{expanded ? <ChevronDown /> : <ChevronUp />}</Button></div>
    {expanded && <div className="ai-chat-scroll">
      {history.length > 1 && <details className="ai-history"><summary>Perguntas anteriores</summary>{history.slice(0, -1).map(item => <div key={item.id}><Button variant="link" disabled={busy} onClick={() => onAsk(item.question)}>{item.question}</Button><p>{item.answer?.text ?? "analisando…"}</p></div>)}</details>}
      {reply && <div className="ai-response"><h2 className="font-display">{reply.title}</h2><Button variant="ghost" className="ai-typed" aria-label="Mostrar resposta completa" onClick={() => setCount(reply.text.length)}><span aria-hidden>{reduced ? reply.text : reply.text.slice(0, count)}</span></Button><p className="sr-only" aria-live="polite">{reply.text}</p>
        {!!reply.basedOn.length && <div className="ai-based"><span>Com base em:</span>{reply.basedOn.map(b => <span className="ai-source" key={b}><Check className="size-3" aria-hidden />{b}</span>)}</div>}
        <div className="ai-followups">{reply.followUps.map(q => <Button variant="secondary" className="ai-chip" key={q} disabled={busy} onClick={() => onAsk(q)}>{q}</Button>)}</div>
      </div>}
    </div>}
    <form className="ai-input-form" onSubmit={e => { e.preventDefault(); if (question.trim() && !busy) { onAsk(question.trim()); setQuestion(""); } }}>
      <label htmlFor="ai-question-input" className="sr-only">Sua pergunta sobre assinaturas</label><input autoComplete="off" id="ai-question-input" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex.: por que os assinantes cancelam?" />
      <Button type="submit" size="icon" disabled={!question.trim() || busy} aria-label="Enviar pergunta" title="Enviar pergunta"><ArrowUp /></Button>
    </form>
  </footer>;
}
