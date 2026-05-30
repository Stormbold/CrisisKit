import { describe, expect, it } from "vitest";
import { validateProject } from "./validate-project.js";
import type { ProjectData } from "./types.js";

const baseProject: ProjectData = {
  config: {
    project: {
      name: "Test",
      type: "household",
      language: "de",
      region: "DE",
      theme: "calm",
      last_reviewed: "2020-01-01",
    },
    disclaimer: {
      enabled: true,
      text: "Test disclaimer",
    },
    emergency_numbers: {
      emergency: "112",
      police: "110",
    },
  },
  contacts: { contacts: [] },
  meetingPoints: { meeting_points: [] },
  checklists: { checklists: [] },
  pets: { pets: [] },
  medication: { persons: [] },
  documents: { documents: [] },
};

describe("validateProject", () => {
  it("warns about stale review date", () => {
    const result = validateProject(baseProject);
    expect(result.issues.some((i) => i.message.includes("not been reviewed"))).toBe(true);
  });

  it("warns about missing medication disclaimer", () => {
    const result = validateProject({
      ...baseProject,
      medication: {
        persons: [{ name: "A", items: [{ name: "Med" }] }],
      },
    });
    expect(result.issues.some((i) => i.file === "medication.yml")).toBe(true);
  });

  it("warns about missing meeting points", () => {
    const result = validateProject(baseProject);
    expect(result.issues.some((i) => i.file === "meeting-points.yml")).toBe(true);
  });

  it("errors when homeassistant type without home-assistant.yml", () => {
    const result = validateProject({
      ...baseProject,
      config: {
        ...baseProject.config,
        project: { ...baseProject.config.project, type: "homeassistant" },
      },
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.file === "home-assistant.yml")).toBe(true);
  });

  it("warns about duplicate entity ids", () => {
    const result = validateProject({
      ...baseProject,
      homeAssistant: {
        enabled: true,
        www: { subdirectory: "crisiskit" },
        dashboard: { title: "Notfall", icon: "mdi:shield-home", path: "notfall" },
        entities: [
          { entity_id: "binary_sensor.test", label: "A" },
          { entity_id: "binary_sensor.test", label: "B" },
        ],
        automations: [],
      },
    });
    expect(result.issues.some((i) => i.message.includes("Duplicate entity_id"))).toBe(true);
  });
});
