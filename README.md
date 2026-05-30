# CrisisKit

Emergencies are the wrong time to search through chats, PDFs and cloud documents.

**CrisisKit generates offline-ready emergency pages, printable checklists and pocket cards from simple YAML files.**

No account. No backend. No tracking. No panic.

## Features

- **YAML in → static HTML & PDF out** — contacts, checklists, meeting points, pets, medication, documents
- **Browser editor** — add, edit and remove entries without touching YAML by hand
- **Home Assistant export** — Lovelace dashboard, package automations, install guide
- **Material Design 3** — calm, readable offline pages
- **Local-first** — your data never leaves your machine during build
- **Open source** — MIT license

## What CrisisKit is NOT

CrisisKit does **not** provide official warnings, medical advice, legal advice or live hazard alerts. It does not replace NINA, emergency services or authorities.

See [docs/safety-boundaries.md](docs/safety-boundaries.md).

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

## Quickstart

```bash
git clone https://github.com/Stormbold/CrisisKit.git
cd crisiskit
pnpm install && pnpm build

# Create a project
node packages/cli/dist/index.js init --template household-de --dir ./crisiskit

# Edit in the browser (optional)
node packages/cli/dist/index.js edit --input ./crisiskit --output ./dist

# Build static output
node packages/cli/dist/index.js build --input ./crisiskit --output ./dist

# Preview locally
node packages/cli/dist/index.js preview --dir ./dist
```

After `pnpm link --global` or `npm install -g` from `packages/cli`, use the `crisiskit` command directly.

## CLI commands

| Command | Description |
|---------|-------------|
| `crisiskit init` | Create a new project from a template |
| `crisiskit build` | Generate HTML, PDF and optional Home Assistant export |
| `crisiskit preview` | Serve built output locally |
| `crisiskit validate` | Validate YAML and show warnings |
| `crisiskit edit` | Edit YAML in the browser |

## Example YAML

```yaml
# contacts.yml
contacts:
  - name: "Thomas Weber"
    role: "Familienkontakt"
    phone: "+49 171 4829103"
    priority: 1
```

Full data model: [docs/data-model.md](docs/data-model.md)

## Output

```
dist/
  index.html
  contacts.html
  meeting-points.html
  power-outage.html
  checklists.html
  documents.html
  pets.html
  medication.html
  emergency-card.html
  offline-checklist.html
  assets/
  pdf/emergency-card.pdf
  pdf/offline-checklist.pdf
  home-assistant/          # when home-assistant.yml enabled
    lovelace-dashboard.yaml
    package.yaml
    INSTALL.md
```

## Templates

| Template | Description |
|----------|-------------|
| `household-de` | Family emergency kit (German) |
| `club-de` | Sports club emergency plan |
| `selfhoster-outage` | Homelab power outage runbook |
| `home-assistant-de` | Household + Home Assistant dashboard export |

Examples live in [`examples/`](examples/).

## Home Assistant

Enable export in `home-assistant.yml` or via `crisiskit edit`. After build, copy `dist/` to `/config/www/crisiskit/` on your Home Assistant host.

See [docs/home-assistant.md](docs/home-assistant.md).

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

CrisisKit does not send your emergency data anywhere. It reads local YAML files and generates static output on your machine.

**Warning:** Generated sites may contain private contacts, addresses or medical notes. Only publish after review.

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

CrisisKit is a private/local preparedness tool. It does not replace official warnings, emergency services, medical advice, or instructions from authorities.
