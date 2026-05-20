# AGENTS.md

## Working Agreements

- Keep changes minimal, local, and reversible.
- Do not commit, push, tag, publish, or release unless explicitly requested by the user.
- Do not change secrets, auth, deployment, or dependency policy without explicit approval.
- Read relevant files before editing.
- State exactly what was verified.

## Project Commands

```bash
npm test
npm run test:pack
npm run typecheck
npm run build
node dist/cli.js audit .
```

Use `npm run dev -- audit .` when a build is not needed.

## Implementation Notes

- This is an ESM TypeScript CLI.
- CLI entrypoint: `src/cli.ts`.
- Audit orchestration: `src/audit/index.ts`.
- Category checks: `src/audit/checks/`.
- Output renderers: `src/output/`.
- Tests use Vitest fixtures under `test/fixtures/`.

## Validation

Run the narrowest relevant test first. Before calling work complete, run:

```bash
npm test
npm run test:pack
npm run typecheck
npm run build
node dist/cli.js audit . --strict
```
