# Release Guide

This repository has a dry-run release workflow for verification and a separate publish workflow for npm publication.

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

## Verification Workflow

`.github/workflows/release.yml` runs on tags, published GitHub releases, and manual dispatch. It performs:

- dependency install with `npm ci`
- typecheck
- tests
- build
- `npm pack --dry-run`
- packed CLI smoke test
- strict self-audit

The workflow intentionally does not publish to npm.

## Publish Workflow

`.github/workflows/publish.yml` runs on published GitHub releases and manual dispatch. It performs the same verification steps and then publishes `repo-health-audit` to npm using GitHub Actions OIDC trusted publishing.

## Notes

Keep the npm trusted publisher configured before running the publish workflow. The dry-run workflow remains the safer default for release validation.
