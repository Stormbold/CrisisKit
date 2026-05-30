import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  parseYamlFile,
  configSchema,
  contactsSchema,
  meetingPointsSchema,
  checklistsSchema,
  petsSchema,
  medicationSchema,
  documentsSchema,
  homeAssistantSchema,
  YamlParseError,
  YamlValidationError,
} from "@crisiskit/schemas";
import type { ProjectData } from "./types.js";

export { YamlParseError, YamlValidationError };

export function loadProject(inputDir: string): ProjectData {
  const requiredFiles = {
    config: "config.yml",
    contacts: "contacts.yml",
    meetingPoints: "meeting-points.yml",
    checklists: "checklists.yml",
    pets: "pets.yml",
    medication: "medication.yml",
    documents: "documents.yml",
  } as const;

  for (const file of Object.values(requiredFiles)) {
    const filePath = join(inputDir, file);
    if (!existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }

  const homeAssistantPath = join(inputDir, "home-assistant.yml");
  const homeAssistant = existsSync(homeAssistantPath)
    ? parseYamlFile(homeAssistantPath, homeAssistantSchema)
    : undefined;

  return {
    config: parseYamlFile(join(inputDir, requiredFiles.config), configSchema),
    contacts: parseYamlFile(join(inputDir, requiredFiles.contacts), contactsSchema),
    meetingPoints: parseYamlFile(
      join(inputDir, requiredFiles.meetingPoints),
      meetingPointsSchema,
    ),
    checklists: parseYamlFile(join(inputDir, requiredFiles.checklists), checklistsSchema),
    pets: parseYamlFile(join(inputDir, requiredFiles.pets), petsSchema),
    medication: parseYamlFile(join(inputDir, requiredFiles.medication), medicationSchema),
    documents: parseYamlFile(join(inputDir, requiredFiles.documents), documentsSchema),
    homeAssistant,
  };
}
