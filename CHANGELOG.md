# Changelog

## 0.1.1 - 2026-05-21

- Add configurable strict threshold support.
- Add package tarball smoke testing and release dry-run workflow.
- Add dependency audit, package smoke, and strict self-audit to CI.
- Improve README, workflow permission, and release workflow detection.
- Add fixtures for docs-only, Python metadata, and broad workflow permissions.
- Rename npm package target to `repo-health-audit` while keeping the `repo-health` command.

## 0.1.0 - 2026-05-20

- Bootstrap local repository audit CLI.
- Add weighted scoring across README, licensing, CI, tests, package metadata, community, docs, release, and agent-readiness categories.
- Add terminal and JSON output modes.
- Add strict mode with default threshold 80.
