# repo-health-cli

Audit local repositories for open-source readiness and get a deterministic health score with actionable recommendations.

`repo-health-cli` is a Lighthouse-style CLI for GitHub repositories. It checks README quality, licensing, CI, tests, package metadata, community files, docs, release readiness, and agent-readiness in one local command.

## Demo

The CLI prints a compact terminal report by default and can emit JSON for automation. See the [basic example](examples/basic.md) for common commands.

## Install

This project is not published to npm by this repository yet. The unscoped `repo-health-cli` npm name is already present on npm, so publishing requires either package ownership or a rename/scoped package decision first.

Use it locally from a cloned checkout:

```bash
npm install
npm run build
node dist/cli.js audit .
```

For development without building first:

```bash
npm run dev -- audit .
```

## Usage

Audit the current repository:

```bash
repo-health audit .
```

Audit another local repository:

```bash
repo-health audit /path/to/repo
```

Print valid JSON only:

```bash
repo-health audit . --json
```

Disable terminal colors:

```bash
repo-health audit . --no-color
```

Fail CI-style when the score is below 80:

```bash
repo-health audit . --strict
```

Use a custom strict threshold:

```bash
repo-health audit . --strict --threshold 90
```

When running from source, replace `repo-health` with `node dist/cli.js` after `npm run build`, or use `npm run dev --`.

## Documentation

- [Guide](docs/guide.md)
- [Basic example](examples/basic.md)
- [Release guide](docs/release.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Sample Output

```txt
Repo Health Score: 78/100 - C

Critical
- Add a LICENSE file.
- Add a test workflow under .github/workflows/.

Recommended
- Add CONTRIBUTING.md.
- Add SECURITY.md.
- Add usage examples to README.md.

Category breakdown
README quality        14/20
Licensing              4/10
CI / automation         8/15
Tests                  10/15
Package metadata        8/10
Community files         2/10
Documentation           5/8
Release readiness       4/7
Agent readiness         3/5
```

## Scoring Categories

Scores are deterministic and weighted to total 100:

| Category | Weight |
| --- | ---: |
| README quality | 20 |
| Licensing | 10 |
| CI / automation | 15 |
| Tests | 15 |
| Package metadata | 10 |
| Community files | 10 |
| Documentation | 8 |
| Release readiness | 7 |
| Agent readiness | 5 |

Each check is scored as pass, warning, or fail. Category scores are rounded and the final score maps to grades:

| Grade | Score |
| --- | ---: |
| A | 90-100 |
| B | 80-89 |
| C | 70-79 |
| D | 60-69 |
| F | below 60 |

## Local Development

```bash
npm install
npm test
npm run test:pack
npm run build
npm run typecheck
npm run dev -- audit .
```

## Roadmap

- Add richer rule explanations and remediation links.
- Add optional GitHub API mode after local auditing is complete.
- Add more ecosystem-specific metadata checks for Python, Rust, Go, and Java.
- Add SARIF or GitHub Actions annotation output.

## Non-goals

- No npm publishing in the MVP.
- No paid APIs.
- No LLM calls.
- No web UI.
- No destructive auto-fixes.
- No large plugin/rule-engine architecture before the core CLI is useful.

## License

Apache-2.0. See [LICENSE](LICENSE).
