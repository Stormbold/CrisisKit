import type { ProjectData, ValidationIssue, ValidationResult } from "./types.js";
import { REVIEW_WARNING_DAYS } from "./defaults.js";

function daysSince(dateStr: string): number {
  const reviewed = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - reviewed.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates];
}

export function validateProject(data: ProjectData, reviewDays = REVIEW_WARNING_DAYS): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!data.config.disclaimer.enabled) {
    issues.push({
      level: "warning",
      file: "config.yml",
      message: "Disclaimer is disabled — consider enabling it for safety clarity",
    });
  }

  const days = daysSince(data.config.project.last_reviewed);
  if (days > reviewDays) {
    issues.push({
      level: "warning",
      file: "config.yml",
      message: `Project has not been reviewed in ${days} days (last: ${data.config.project.last_reviewed})`,
    });
  }

  const priorityContacts = data.contacts.contacts.filter((c) => c.priority === 1);
  if (priorityContacts.length === 0 && data.contacts.contacts.length > 0) {
    issues.push({
      level: "warning",
      file: "contacts.yml",
      message: "No priority-1 contacts defined",
    });
  }

  if (data.contacts.contacts.length === 0) {
    issues.push({
      level: "warning",
      file: "contacts.yml",
      message: "No contacts defined",
    });
  }

  if (data.meetingPoints.meeting_points.length === 0) {
    issues.push({
      level: "warning",
      file: "meeting-points.yml",
      message: "No meeting points defined",
    });
  }

  const hasMedicationEntries = data.medication.persons.some((p) => p.items.length > 0);
  if (hasMedicationEntries && !data.medication.disclaimer?.trim()) {
    issues.push({
      level: "warning",
      file: "medication.yml",
      message: "Medication entries exist without a safety disclaimer",
    });
  }

  if (data.config.project.type === "homeassistant" && !data.homeAssistant) {
    issues.push({
      level: "error",
      file: "home-assistant.yml",
      message: "Project type is homeassistant but home-assistant.yml is missing",
    });
  }

  if (data.homeAssistant?.enabled) {
    const ha = data.homeAssistant;

    if (ha.entities.length === 0 && ha.automations.length === 0) {
      issues.push({
        level: "warning",
        file: "home-assistant.yml",
        message: "Home Assistant export enabled but no entities or automations configured",
      });
    } else if (ha.entities.length === 0) {
      issues.push({
        level: "warning",
        file: "home-assistant.yml",
        message: "Home Assistant export enabled but no entities configured",
      });
    }

    for (const entityId of findDuplicates(ha.entities.map((e) => e.entity_id))) {
      issues.push({
        level: "error",
        file: "home-assistant.yml",
        message: `Duplicate entity_id: ${entityId}`,
      });
    }

    for (const id of findDuplicates(ha.automations.map((a) => a.id))) {
      issues.push({
        level: "error",
        file: "home-assistant.yml",
        message: `Duplicate automation id: ${id}`,
      });
    }

    const entityIds = new Set(ha.entities.map((e) => e.entity_id));
    for (const automation of ha.automations) {
      if (!entityIds.has(automation.trigger_entity)) {
        issues.push({
          level: "warning",
          file: "home-assistant.yml",
          message: `Automation "${automation.id}" references ${automation.trigger_entity} which is not in entities list`,
        });
      }
    }
  }

  return {
    valid: issues.filter((i) => i.level === "error").length === 0,
    issues,
  };
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues
    .map((issue) => {
      const prefix = issue.level === "error" ? "✗" : "⚠";
      const file = issue.file ? ` ${issue.file}` : "";
      return `${prefix}${file} ${issue.message}`;
    })
    .join("\n");
}
