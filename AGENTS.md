<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- src/engine/* is a verbatim, tested data engine (synthetic dataset via generateDataset); never edit it. tsconfig has noUncheckedIndexedAccess=false so it compiles unchanged.
- UI reads data only via src/lib/dashboard-data.ts (module singleton over the engine); dashboard components in src/components/dashboard are presentational — no business math there.
- Design tokens live in src/styles.css as full hsl() values (user request), mapped in @theme inline; categorical chart colors are --cat-1..6.
- Correlation modes, risk summaries, people samples, deltas and insight view-models are computed in the shared dashboard singleton; engine entry points may internally recompute risk and must remain untouched.
- Insight navigation targets stable card IDs; chart geometry and local avatar hashing are presentation-only calculations.
