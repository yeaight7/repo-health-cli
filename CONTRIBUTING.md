# Contributing

`repo-health-cli` is a small TypeScript CLI. Keep changes focused, covered by tests, and aligned with the local audit-first MVP.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

Run the CLI locally after building:

```bash
node dist/cli.js audit .
```

Or run from source:

```bash
npm run dev -- audit .
```

## Pull Requests

- Keep diffs minimal and reversible.
- Add or update tests for scoring, output, or CLI behavior changes.
- Do not add GitHub API, LLM, publishing, or autofix behavior unless that scope is explicitly approved.
- State which commands were run and whether they passed.
