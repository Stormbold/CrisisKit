import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { renderHomeAssistant } from "./render-home-assistant.js";
import type { ProjectData } from "@crisiskit/core";

const baseProject: ProjectData = {
  config: {
    project: {
      name: "Test HA",
      type: "homeassistant",
      language: "de",
      region: "DE",
      theme: "calm",
      last_reviewed: "2026-05-30",
    },
    disclaimer: { enabled: true, text: "Test disclaimer" },
    emergency_numbers: { emergency: "112", police: "110" },
  },
  contacts: { contacts: [] },
  meetingPoints: { meeting_points: [] },
  checklists: { checklists: [] },
  pets: { pets: [] },
  medication: { persons: [] },
  documents: { documents: [] },
  homeAssistant: {
    enabled: true,
    www: { subdirectory: "crisiskit" },
    dashboard: { title: "Notfall", icon: "mdi:shield-home", path: "notfall" },
    entities: [{ entity_id: "binary_sensor.test", label: "Test Sensor" }],
    automations: [
      {
        id: "test_alarm",
        alias: "Test Alarm",
        enabled: true,
        trigger_entity: "binary_sensor.test",
        trigger_to: "on",
        notify: "persistent_notification",
        enable_notfallmodus: true,
      },
    ],
  },
};

describe("renderHomeAssistant", () => {
  it("returns null when disabled", () => {
    const result = renderHomeAssistant(
      {
        ...baseProject,
        homeAssistant: { ...baseProject.homeAssistant!, enabled: false },
      },
      "/tmp/out",
    );
    expect(result).toBeNull();
  });

  it("writes lovelace, package and install files", () => {
    const dir = mkdtempSync(join(tmpdir(), "crisiskit-ha-"));
    try {
      const result = renderHomeAssistant(baseProject, dir);
      expect(result?.files).toEqual([
        "home-assistant/lovelace-dashboard.yaml",
        "home-assistant/package.yaml",
        "home-assistant/INSTALL.md",
      ]);

      const lovelace = readFileSync(join(dir, "home-assistant", "lovelace-dashboard.yaml"), "utf-8");
      expect(lovelace).toContain("binary_sensor.test");
      expect(lovelace).toContain("input_boolean.crisiskit_notfallmodus");
      expect(lovelace).toContain("emergency-card.html");
      expect(lovelace).toContain("offline-checklist.html");

      const pkg = readFileSync(join(dir, "home-assistant", "package.yaml"), "utf-8");
      expect(pkg).toContain("crisiskit_test_alarm");
      expect(pkg).toContain("persistent_notification.create");

      const install = readFileSync(join(dir, "home-assistant", "INSTALL.md"), "utf-8");
      expect(install).toContain("/config/www/crisiskit/");
      expect(install).toContain("github.com/crisiskit/crisiskit");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
