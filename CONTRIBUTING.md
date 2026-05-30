# Contributing to CrisisKit

Thank you for your interest in contributing!

## Development setup

```bash
pnpm install
pnpm build
pnpm test
```

## Project structure

```
packages/
  schemas/    Zod schemas and YAML parsing
  core/       Load project, validate, save
  renderer/   HTML templates, PDF generation, Home Assistant export
  cli/        Commander CLI and browser editor
examples/     Sample YAML projects
docs/         Documentation
```

## Pull requests

- Keep changes focused
- Run `pnpm test` and `pnpm lint` before submitting
- Add tests for schema or validation changes
- Do not add features that violate [docs/safety-boundaries.md](docs/safety-boundaries.md)

## Good first issues

- Add English household template
- Add print stylesheet improvements
- Add QR code generation for static pages
- Add GitHub Pages deployment docs

## Code of conduct

Be respectful and constructive. CrisisKit serves real emergency preparedness needs — accuracy and safety matter.
