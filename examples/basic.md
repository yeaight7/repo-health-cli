# Basic Example

Build the CLI:

```bash
npm run build
```

Audit the current repository:

```bash
node dist/cli.js audit .
```

Generate machine-readable output:

```bash
node dist/cli.js audit . --json
```

Use strict mode in automation:

```bash
node dist/cli.js audit . --strict
```

Strict mode exits with code `2` when the score is below 80.
