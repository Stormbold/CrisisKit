import { z } from "zod";

const entityIdPattern = /^[a-z_]+\.[a-z0-9_]+$/;

export const haEntitySchema = z.object({
  entity_id: z.string().regex(entityIdPattern, "Expected format: domain.entity_name"),
  label: z.string().min(1),
  icon: z.string().optional(),
});

export const haAutomationSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores"),
  alias: z.string().min(1),
  enabled: z.boolean().default(true),
  trigger_entity: z.string().regex(entityIdPattern),
  trigger_from: z.string().optional(),
  trigger_to: z.string().default("on"),
  notify: z.enum(["persistent_notification", "none"]).default("persistent_notification"),
  message: z.string().optional(),
  enable_notfallmodus: z.boolean().default(true),
});

export const homeAssistantSchema = z.object({
  enabled: z.boolean().default(true),
  www: z
    .object({
      subdirectory: z.string().default("crisiskit"),
    })
    .default({}),
  dashboard: z
    .object({
      title: z.string().default("Notfall"),
      icon: z.string().default("mdi:shield-home"),
      path: z.string().default("notfall"),
    })
    .default({}),
  entities: z.array(haEntitySchema).default([]),
  automations: z.array(haAutomationSchema).default([]),
});

export type HomeAssistant = z.output<typeof homeAssistantSchema>;
export type HaEntity = z.output<typeof haEntitySchema>;
export type HaAutomation = z.output<typeof haAutomationSchema>;
