# CrisisKit

Emergencies are the wrong time to search through chats, PDFs and cloud documents.

**CrisisKit generates offline-ready emergency pages, printable checklists and pocket cards from simple YAML files.**

No account. No backend. No tracking. No panic.

## What CrisisKit is

CrisisKit helps you prepare and publish **offline emergency information** for your own household, club, team or local group.

- YAML in → static HTML, printable PDFs out
- Local-first, versionable, printable
- Open source (MIT)

## What CrisisKit is NOT

CrisisKit does **not** provide official warnings, medical advice, legal advice or live hazard alerts. It does not replace NINA, emergency services or authorities.

See [docs/safety-boundaries.md](docs/safety-boundaries.md).

## Quickstart

```bash
pnpm install && pnpm build

# Create a project
node packages/cli/dist/index.js init --template household-de --dir ./crisiskit

# Edit YAML files in ./crisiskit/
# Or use the browser editor:
node packages/cli/dist/index.js edit --input ./crisiskit --output ./dist

# Build
node packages/cli/dist/index.js build --input ./crisiskit --output ./dist

# Preview
node packages/cli/dist/index.js preview --dir ./dist
```

## CLI commands

| Command | Description |
|---------|-------------|
| `crisiskit init` | Create a new project from a template |
| `crisiskit build` | Generate HTML and PDF output |
| `crisiskit preview` | Serve built output locally |
| `crisiskit validate` | Validate YAML and show warnings |
| `crisiskit edit` | Edit YAML in the browser (add, change, remove entries) |

## Example YAML

```yaml
# contacts.yml
contacts:
  - name: "Thomas Weber"
    role: "Familienkontakt"
    phone: "+49 171 4829103"
    priority: 1
```

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
  assets/
  pdf/emergency-card.pdf
  pdf/offline-checklist.pdf
```

## Templates

- `examples/household-de` — Family emergency kit (German)
- `examples/club-de` — Sports club emergency plan
- `examples/selfhoster-outage` — Homelab power outage runbook
- `examples/home-assistant-de` — Household + [Home Assistant](docs/home-assistant.md) dashboard export

## Home Assistant

CrisisKit can export a Lovelace dashboard, HA package and install guide when `home-assistant.yml` has `enabled: true`. Configure entities and automations in YAML or via `crisiskit edit` (browser editor). Copy built files to `/config/www/crisiskit/` — fully local, compatible with [Home Assistant](https://www.home-assistant.io/).

See [docs/home-assistant.md](docs/home-assistant.md).

## Screenshots

<!-- TODO: Add screenshots after first build -->

## Privacy

CrisisKit does not send your emergency data anywhere. It reads local YAML files and generates static output on your machine.

**Warning:** If you deploy a generated site publicly, private contacts, addresses or medical notes may become visible. Only publish after review.

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

CrisisKit is a private/local preparedness tool. It does not replace official warnings, emergency services, medical advice, or instructions from authorities.
