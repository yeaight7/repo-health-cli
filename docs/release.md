# Release Guide

This repository has a GitHub release workflow that verifies package readiness without publishing to npm.

## Current Publishing Status

The package is published as `repo-health-audit` because both `repo-health` and `repo-health-cli` are already present on npm.

The package exposes the `repo-health` binary.

## Verification Before Publishing

Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run
npm run test:pack
node dist/cli.js audit . --strict
```

## Release Workflow

`.github/workflows/release.yml` runs on tags, published GitHub releases, and manual dispatch. It performs:

- dependency install with `npm ci`
- typecheck
- tests
- build
- `npm pack --dry-run`
- packed CLI smoke test
- strict self-audit

The workflow intentionally does not publish to npm.

## Future npm Publishing

Prefer npm trusted publishing with GitHub Actions OIDC for future automated publishing. Add `id-token: write` only when the npm trusted publisher is configured and the workflow contains a real publish step.
