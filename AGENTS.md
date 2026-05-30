# AGENTS.md

Guidance for AI coding agents working on CrisisKit.

## Project purpose

CrisisKit is an open-source CLI that generates offline emergency pages and PDFs from YAML files. It is **not** a warning app, medical app or cloud service.

## Architecture

- `packages/schemas` — Zod schemas and YAML parsing
- `packages/core` — load project, validate with warnings
- `packages/renderer` — Eta HTML templates, Playwright PDFs
- `packages/cli` — Commander CLI (`init`, `build`, `preview`, `validate`)
- `examples/` — sample YAML projects

## Safety rules

- Never add cloud sync, accounts, analytics or live warning feeds
- Medication data is documentation only — always require disclaimers
- Keep disclaimers visible in generated output
- Do not add medical dosage recommendations

## Commands

```bash
pnpm install
pnpm build
pnpm test
node packages/cli/dist/index.js build --input examples/household-de --output /tmp/dist
```

## Templates

HTML templates live in `packages/renderer/src/templates/`. CSS in `packages/renderer/src/assets/styles/`.

When changing templates, test with `examples/household-de`.
