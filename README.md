# Meridiano Subscriber Compass

Dashboard de **inteligência de assinaturas digitais** da *Gazeta Meridiano*, um jornal **fictício**. Todos os dados são **100% sintéticos**, gerados no navegador por uma simulação determinística (seed fixa), sem nenhuma informação real de assinantes (LGPD).

Projeto de portfólio de Gabriel Rangel: dashboard web com motor de métricas próprio, motor de insights por regras e uma "mesa de análise" que responde perguntas sobre o painel.

## O que tem aqui
- **Motor de dados** (`src/engine/`): geração do dataset, métricas, retenção por coorte (Kaplan-Meier, trata censura à direita), correlação em variações mês a mês (evita correlação espúria), projeção até a meta, risco de cancelamento por assinante e regras de insight com severidade.
- **Dashboard** em 4 visões: Visão geral, Aquisição, Retenção e Risco e sinergia.
- **Mesa de análise** (Modo IA): clique num card e o painel gera leituras ligadas ao card em foco, com legendas e sugestões de próxima pergunta. As respostas vêm do motor determinístico; **a IA nunca calcula números**, só escolhe, ordena e redige.
- Testes (vitest) cobrindo o motor, o roteador de perguntas e as legendas.

## Rodar localmente
```bash
bun install   # ou npm install
bun dev       # ou npm run dev
bun run test  # vitest
```

## Inspiração e créditos
A interação da mesa de análise (dashboard que escurece, card em foco, cards gerados ligados por linhas e painel de conversa) foi inspirada no dashboard de RH com "Modo IA" de **Iago Cruz**, compartilhado no LinkedIn. Domínio, dados, motor de métricas e insights, gráficos e código deste projeto são próprios.

## Stack
TanStack Start + React + Vite, Tailwind + shadcn/ui, Recharts, framer-motion. Gerado e iterado com Lovable; mantido via GitHub.
