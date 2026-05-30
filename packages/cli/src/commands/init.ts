import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const examplesRoot = join(packageRoot, "examples");

export const TEMPLATES = [
  "household-de",
  "club-de",
  "selfhoster-outage",
  "home-assistant-de",
] as const;
export type TemplateName = (typeof TEMPLATES)[number];

export interface InitOptions {
  template?: TemplateName;
  dir: string;
}

export async function runInit(options: InitOptions): Promise<void> {
  let template = options.template;

  if (!template) {
    const rl = createInterface({ input, output });
    console.log("\nWhat do you want to create?\n");
    console.log("  1. Household emergency kit (household-de)");
    console.log("  2. Club emergency kit (club-de)");
    console.log("  3. Selfhoster outage runbook (selfhoster-outage)");
    console.log("  4. Home Assistant household (home-assistant-de)\n");

    const answer = await rl.question("Choose [1-4]: ");
    rl.close();

    const choice: Record<string, TemplateName> = {
      "1": "household-de",
      "2": "club-de",
      "3": "selfhoster-outage",
      "4": "home-assistant-de",
    };
    template = choice[answer.trim()] ?? "household-de";
  }

  const sourceDir = join(examplesRoot, template);
  if (!existsSync(sourceDir)) {
    throw new Error(`Template not found: ${template}`);
  }

  const targetDir = options.dir;
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    throw new Error(`Target directory is not empty: ${targetDir}`);
  }

  mkdirSync(targetDir, { recursive: true });

  for (const file of readdirSync(sourceDir)) {
    if (file.endsWith(".yml")) {
      cpSync(join(sourceDir, file), join(targetDir, file));
    }
  }

  console.log(`\n✓ Created CrisisKit project in ${targetDir}`);
  console.log(`  Template: ${template}`);
  console.log("\nNext steps:");
  console.log(`  1. Edit YAML files in ${targetDir}`);
  console.log(`  2. Run: crisiskit build --input ${targetDir}`);
  console.log("  3. Run: crisiskit preview\n");
  console.log(`  Optional: crisiskit edit --input ${targetDir} — browser editor incl. Home Assistant`);
  if (template === "home-assistant-de") {
    console.log("  Home Assistant: adjust entity IDs in home-assistant.yml, then copy");
    console.log("  dist/ to /config/www/crisiskit/ — see dist/home-assistant/INSTALL.md\n");
  }
}
