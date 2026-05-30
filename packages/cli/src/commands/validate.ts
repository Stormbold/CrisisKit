import { resolve } from "node:path";
import {
  loadProject,
  validateProject,
  formatValidationIssues,
  YamlParseError,
  YamlValidationError,
} from "@crisiskit/core";

export interface ValidateOptions {
  input: string;
}

export function runValidate(options: ValidateOptions): number {
  const inputDir = resolve(options.input);

  console.log(`\nValidating ${inputDir}...\n`);

  try {
    const data = loadProject(inputDir);
    const files = [
      "config.yml",
      "contacts.yml",
      "meeting-points.yml",
      "checklists.yml",
      "pets.yml",
      "medication.yml",
      "documents.yml",
    ];

    for (const file of files) {
      console.log(`✓ ${file} valid`);
    }

    if (data.homeAssistant) {
      console.log("✓ home-assistant.yml valid");
      if (!data.homeAssistant.enabled) {
        console.log("ℹ Home Assistant export disabled (enabled: false)");
      }
    } else {
      console.log("ℹ home-assistant.yml not found — Home Assistant export disabled");
    }

    const validation = validateProject(data);
    if (validation.issues.length > 0) {
      console.log(formatValidationIssues(validation.issues));
    }

    if (!validation.valid) {
      return 1;
    }

    console.log("\n✓ Validation complete.\n");
    return 0;
  } catch (error) {
    if (error instanceof YamlValidationError) {
      console.error(`✗ ${error.message}`);
      return 1;
    }
    if (error instanceof YamlParseError) {
      console.error(`✗ ${error.message}`);
      return 1;
    }
    throw error;
  }
}
