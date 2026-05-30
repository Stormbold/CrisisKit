# Data Model

CrisisKit reads YAML files from a project directory.

## Files

| File | Purpose |
|------|---------|
| `config.yml` | Project metadata, disclaimer, emergency numbers |
| `contacts.yml` | Prioritized contacts |
| `meeting-points.yml` | Meeting / evacuation points |
| `checklists.yml` | Checklists with items |
| `pets.yml` | Pet emergency information |
| `medication.yml` | Private medication documentation |
| `documents.yml` | Important documents and locations |
| `home-assistant.yml` | Optional Home Assistant dashboard + automations export |

## Example: config.yml

```yaml
project:
  name: "Weber — Notfallmappe"
  type: "household"
  language: "de"
  region: "DE"
  theme: "calm"
  last_reviewed: "2026-05-30"

disclaimer:
  enabled: true
  text: "Diese Notfallmappe ersetzt keine amtlichen Warnungen."

emergency_numbers:
  emergency: "112"
  police: "110"
```

## Example: contacts.yml

```yaml
contacts:
  - name: "Thomas Weber"
    role: "Familienkontakt"
    phone: "+49 171 4829103"
    priority: 1
    notes: "Kann Haustiere abholen"
    public: false
```

See `examples/` for complete sample projects. Home Assistant setup: [home-assistant.md](home-assistant.md).

## Example: home-assistant.yml

Optional file for Home Assistant export (`dist/home-assistant/`).

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Generate HA artifacts on build (default: `true`) |
| `www.subdirectory` | string | Folder under `/config/www/` (default: `crisiskit`) |
| `dashboard.title` | string | Lovelace dashboard title |
| `dashboard.icon` | string | MDI icon for dashboard |
| `dashboard.path` | string | URL path slug for dashboard view |
| `entities[]` | array | Entities shown on dashboard |
| `entities[].entity_id` | string | HA entity ID (`domain.name`) |
| `entities[].label` | string | Display name |
| `entities[].icon` | string | Optional MDI icon |
| `automations[]` | array | Package automations (local notifications) |
| `automations[].id` | string | Unique ID (`a-z0-9_`) |
| `automations[].alias` | string | Human-readable name |
| `automations[].enabled` | boolean | Include in package (default: `true`) |
| `automations[].trigger_entity` | string | Entity to watch |
| `automations[].trigger_from` | string | Optional previous state |
| `automations[].trigger_to` | string | Target state (default: `on`) |
| `automations[].notify` | enum | `persistent_notification` or `none` |
| `automations[].message` | string | Optional notification text |
| `automations[].enable_notfallmodus` | boolean | Turn on `input_boolean.crisiskit_notfallmodus` |

```yaml
enabled: true
www:
  subdirectory: crisiskit
dashboard:
  title: "Notfall"
  icon: mdi:shield-home
  path: notfall
entities:
  - entity_id: binary_sensor.stromnetz
    label: "Stromnetz verfügbar"
automations:
  - id: stromausfall_hinweis
    alias: "CrisisKit: Stromausfall"
    trigger_entity: binary_sensor.stromnetz
    trigger_to: "off"
```
