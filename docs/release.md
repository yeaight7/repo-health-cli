# Release Guide

This repository has a GitHub release workflow that verifies package readiness without publishing to npm.

## Current Publishing Status

The unscoped `repo-health-cli` package name already exists on npm at version `0.1.4` based on `npm view repo-health-cli name version --json`.

Do not run `npm publish` from this repository unless one of these is true:

- npm ownership of `repo-health-cli` is confirmed
- package name is changed
- package is moved to an approved scope

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

Prefer npm trusted publishing with GitHub Actions OIDC when package ownership/name is resolved. Add `id-token: write` only when the npm trusted publisher is configured and the workflow contains a real publish step.
