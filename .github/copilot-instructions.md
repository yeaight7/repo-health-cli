# Copilot Instructions

This repository contains a TypeScript/Node.js CLI for local repository health audits.

Follow these rules:

- Preserve the local audit-first MVP scope.
- Do not add GitHub API, LLM, web UI, publishing, release, or autofix behavior unless explicitly requested.
- Keep dependencies minimal.
- Prefer standard Node.js `fs` and `path` APIs for file inspection.
- Keep scoring deterministic.
- Update tests when changing scoring, checks, CLI behavior, or output format.

Useful commands:

```bash
npm test
npm run typecheck
npm run build
npm run dev -- audit .
```
