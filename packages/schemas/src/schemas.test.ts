import { describe, expect, it } from "vitest";
import {
  configSchema,
  contactsSchema,
  parseYamlString,
  checklistsSchema,
  medicationSchema,
  homeAssistantSchema,
} from "./index.js";

describe("configSchema", () => {
  it("parses valid config", () => {
    const data = parseYamlString(
      `
project:
  name: Test
  type: household
  language: de
  region: DE
  theme: calm
  last_reviewed: "2026-05-30"
disclaimer:
  enabled: true
  text: Test disclaimer
emergency_numbers:
  emergency: "112"
  police: "110"
`,
      configSchema,
    );
    expect(data.project.name).toBe("Test");
    expect(data.emergency_numbers.emergency).toBe("112");
  });
});

describe("contactsSchema", () => {
  it("parses contacts with defaults", () => {
    const data = parseYamlString(
      `
contacts:
  - name: Max
    role: Contact
    phone: "+491234"
`,
      contactsSchema,
    );
    expect(data.contacts[0]?.priority).toBe(5);
  });
});

describe("checklistsSchema", () => {
  it("requires checklist items", () => {
    expect(() =>
      parseYamlString(
        `
checklists:
  - title: Test
    items: []
`,
        checklistsSchema,
      ),
    ).toThrow();
  });
});

describe("medicationSchema", () => {
  it("allows empty persons without disclaimer", () => {
    const data = parseYamlString(`persons: []`, medicationSchema);
    expect(data.persons).toEqual([]);
  });
});

describe("homeAssistantSchema", () => {
  it("parses entity and automation config", () => {
    const data = parseYamlString(
      `
enabled: true
entities:
  - entity_id: binary_sensor.stromnetz
    label: Strom
automations:
  - id: test_alarm
    alias: Test
    trigger_entity: binary_sensor.stromnetz
`,
      homeAssistantSchema,
    );
    expect(data.entities[0]?.entity_id).toBe("binary_sensor.stromnetz");
    expect(data.automations[0]?.id).toBe("test_alarm");
  });

  it("rejects invalid entity_id format", () => {
    expect(() =>
      homeAssistantSchema.parse({
        entities: [{ entity_id: "INVALID", label: "Bad" }],
      }),
    ).toThrow();
  });

  it("accepts optional trigger_from on automations", () => {
    const data = homeAssistantSchema.parse({
      automations: [
        {
          id: "from_test",
          alias: "From test",
          trigger_entity: "binary_sensor.test",
          trigger_from: "off",
          trigger_to: "on",
        },
      ],
    });
    expect(data.automations[0]?.trigger_from).toBe("off");
  });
});
