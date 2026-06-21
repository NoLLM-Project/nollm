## PR Title
<!--
Use the format:
<type>: <short description>

Types:
- scaffold
- wire
- behavior
- fix
- refactor
- docs
-->

---

## Summary
<!--
Briefly describe what this PR does.
Focus on:
- What was added or changed
- Which folders were touched
- Any structural or wiring notes
-->

---

## Checklist

### Structural
- [ ] Folder structure is coherent and intentional
- [ ] No accidental file additions, deletions, or renames
- [ ] No leftover debug files or temporary scaffolding

### Code / Wiring
- [ ] All imports and paths resolve correctly
- [ ] No console errors in the staging deployment
- [ ] surfaces/ui loads without breaking
- [ ] No half‑wired engine calls or placeholder logic leaking into production

### Behavior (if applicable)
- [ ] New behavior is isolated and does not break existing flows
- [ ] Registry entries (if added) are correct and stable
- [ ] No invariant violations or missing checks

### Safety
- [ ] No sensitive or internal‑only files included in the PR
- [ ] No changes to system/ that would break the public demo
- [ ] No direct modifications to main‑only configuration

### Deployment
- [ ] Staging deployment tested at: https://nollm-staging.pages.dev
- [ ] UI renders correctly
- [ ] Engine wiring behaves as expected (or is intentionally stubbed)
- [ ] Ready for promotion to `main`

---

## Notes (optional)
<!--
Add any context for future work, partial implementations,
or follow‑up tasks that should happen after this PR.
-->
