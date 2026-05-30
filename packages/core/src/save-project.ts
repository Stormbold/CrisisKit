import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import type { ZodTypeAny } from "zod";
import {
  configSchema,
  contactsSchema,
  meetingPointsSchema,
  checklistsSchema,
  petsSchema,
  medicationSchema,
  documentsSchema,
  homeAssistantSchema,
} from "@crisiskit/schemas";
import type { HomeAssistant } from "@crisiskit/schemas";
import type { ProjectData } from "./types.js";
import { loadProject } from "./load-project.js";

export type ProjectFileKey =
  | "config"
  | "contacts"
  | "meetingPoints"
  | "checklists"
  | "pets"
  | "medication"
  | "documents"
  | "homeAssistant";

const FILE_MAP: Record<
  ProjectFileKey,
  { filename: string; schema: ZodTypeAny; optional?: boolean }
> = {
  config: { filename: "config.yml", schema: configSchema },
  contacts: { filename: "contacts.yml", schema: contactsSchema },
  meetingPoints: { filename: "meeting-points.yml", schema: meetingPointsSchema },
  checklists: { filename: "checklists.yml", schema: checklistsSchema },
  pets: { filename: "pets.yml", schema: petsSchema },
  medication: { filename: "medication.yml", schema: medicationSchema },
  documents: { filename: "documents.yml", schema: documentsSchema },
  homeAssistant: { filename: "home-assistant.yml", schema: homeAssistantSchema, optional: true },
};

export function getProjectFileKeyFromApiName(name: string): ProjectFileKey | null {
  const map: Record<string, ProjectFileKey> = {
    config: "config",
    contacts: "contacts",
    "meeting-points": "meetingPoints",
    checklists: "checklists",
    pets: "pets",
    medication: "medication",
    documents: "documents",
    "home-assistant": "homeAssistant",
  };
  return map[name] ?? null;
}

export function loadProjectJson(inputDir: string): ProjectData {
  return loadProject(inputDir);
}

export function saveProjectFile(inputDir: string, key: ProjectFileKey, data: unknown): void {
  const entry = FILE_MAP[key];
  const result = entry.schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      result.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; "),
    );
  }

  writeFileSync(
    join(inputDir, entry.filename),
    `${stringify(result.data, { lineWidth: 0 })}\n`,
    "utf-8",
  );
}

export function createDefaultHomeAssistant(enabled = false): HomeAssistant {
  return homeAssistantSchema.parse({ enabled });
}

export function listEditableFiles(data: ProjectData): ProjectFileKey[] {
  const keys = Object.keys(FILE_MAP) as ProjectFileKey[];
  return keys.filter((key) => {
    if (key !== "homeAssistant") return true;
    return data.homeAssistant !== undefined || data.config.project.type === "homeassistant";
  });
}
