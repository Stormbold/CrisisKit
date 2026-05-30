# Quickstart

## Install

```bash
git clone https://github.com/Stormbold/CrisisKit.git
cd crisiskit
pnpm install
pnpm build
```

## Create a project

```bash
node packages/cli/dist/index.js init --template household-de --dir ./crisiskit
```

Or interactively:

```bash
npx crisiskit init
```

## Edit YAML files

Edit the files in `crisiskit/`:

- `config.yml` — project name, disclaimer, emergency numbers
- `contacts.yml` — emergency contacts
- `meeting-points.yml` — meeting points
- `checklists.yml` — checklists
- `pets.yml` — pets
- `medication.yml` — medication documentation (not advice)
- `documents.yml` — important documents

## Build

```bash
npx crisiskit build --input ./crisiskit --output ./dist
```

## Preview

```bash
npx crisiskit preview --dir ./dist
```

Open http://localhost:4173

## Validate

```bash
npx crisiskit validate --input ./crisiskit
```
