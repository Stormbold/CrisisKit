import type {
  Config,
  Contacts,
  MeetingPoints,
  Checklists,
  Pets,
  Medication,
  Documents,
  HomeAssistant,
} from "@crisiskit/schemas";

export interface ProjectData {
  config: Config;
  contacts: Contacts;
  meetingPoints: MeetingPoints;
  checklists: Checklists;
  pets: Pets;
  medication: Medication;
  documents: Documents;
  homeAssistant?: HomeAssistant;
}

export interface ValidationIssue {
  level: "error" | "warning";
  file?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
