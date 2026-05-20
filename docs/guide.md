# repo-health-cli Guide

`repo-health-cli` audits a local repository and returns a weighted open-source readiness score.

## What It Checks

The MVP focuses on files and metadata that can be inspected locally:

- README quality
- license files and license mentions
- GitHub Actions CI configuration
- tests and package test scripts
- package metadata
- community files
- documentation and examples
- release readiness signals
- agent-readiness files

## Scoring

Each category has a fixed weight. Checks produce `pass`, `warn`, or `fail`; category scores are rounded and summed to a 0-100 score.

Strict mode exits non-zero when the score is below 80:

```bash
node dist/cli.js audit . --strict
```

Use `--threshold` to change the strict-mode cutoff:

```bash
node dist/cli.js audit . --strict --threshold 90
```

## JSON Output

Use JSON output for automation:

```bash
node dist/cli.js audit . --json
```

The JSON report includes the repo path, score, grade, category results, summary counts, and grouped recommendations.

## Package Verification

The package smoke test verifies the packed tarball, installs it into a temporary project, and runs the installed `repo-health` binary:

```bash
npm run test:pack
```

This checks the packaged CLI path, not just `node dist/cli.js`.
