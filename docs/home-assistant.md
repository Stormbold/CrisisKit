# Home Assistant Integration

CrisisKit integrates with [Home Assistant](https://www.home-assistant.io/) — local control, no cloud required. This matches both projects: your emergency data stays on your network.

## How it works

1. **Static pages** — CrisisKit builds HTML/PDF as usual.
2. **`home-assistant.yml`** — optional config with your HA entity IDs, dashboard and automations.
3. **Build output** — when `home-assistant.yml` exists and `enabled: true`, CrisisKit also writes:

```
dist/home-assistant/
  lovelace-dashboard.yaml   # Dashboard with iframe + entity cards
  package.yaml              # input_boolean + notification automations
  INSTALL.md                # Step-by-step setup
```

4. **Deploy** — copy `dist/*` to `/config/www/crisiskit/` on your Home Assistant host. Pages are available at `/local/crisiskit/index.html`.

## Quick start

```bash
crisiskit init --template home-assistant-de --dir ./crisiskit
# Edit home-assistant.yml — set your entity IDs
# Or use the browser editor:
crisiskit edit --input ./crisiskit
crisiskit build --input ./crisiskit --output ./dist
```

Then follow `dist/home-assistant/INSTALL.md`.

## Browser editor

Run `crisiskit edit` and open the **Home Assistant** section to:

- Enable or disable HA export
- Configure WWW folder and dashboard settings
- Add, edit and remove entities and automations

Changes are saved directly to `home-assistant.yml`.

## Example `home-assistant.yml`

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
    icon: mdi:transmission-tower

  - entity_id: person.thomas_weber
    label: "Thomas zuhause"

automations:
  - id: stromausfall_hinweis
    alias: "CrisisKit: Stromausfall"
    trigger_entity: binary_sensor.stromnetz
    trigger_to: "off"
    message: "Stromnetz offline. Checkliste: /local/crisiskit/power-outage.html"
```

Find entity IDs in Home Assistant: **Developer Tools → States**.

## Lovelace dashboard

The generated dashboard includes:

- Disclaimer markdown card
- Quick-link buttons to all CrisisKit pages (incl. Notfallkarte, Offline-Checkliste)
- Iframe embedding your offline Notfallmappe
- Notfallmodus toggle (`input_boolean.crisiskit_notfallmodus`)
- Entity cards for configured sensors and persons

Import via **Settings → Dashboards** (raw YAML / config editor).

## Package automations

`package.yaml` creates:

- `input_boolean.crisiskit_notfallmodus` — helper you can use in other automations
- Notification automations when configured triggers fire

**Review all automations before enabling.** CrisisKit only generates local notifications — no external services.

## Privacy

Home Assistant keeps data local ([Home Assistant privacy model](https://www.home-assistant.io/)). Your CrisisKit pages may still contain phone numbers and medical notes. Restrict dashboard access accordingly.

## What CrisisKit does NOT do

- No live API calls to Home Assistant during build
- No cloud relay or Nabu Casa dependency
- No replacement for NINA or official warnings
- No automatic entity discovery — you configure entity IDs explicitly
