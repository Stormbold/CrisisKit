import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["household", "club", "community", "selfhoster", "homeassistant"]),
  language: z.string().default("de"),
  region: z.string().default("DE"),
  theme: z.string().default("calm"),
  last_reviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});

export const disclaimerSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().min(1),
});

export const emergencyNumbersSchema = z.object({
  emergency: z.string().min(1),
  police: z.string().optional(),
  poison_control: z.string().optional(),
});

export const configSchema = z.object({
  project: projectSchema,
  disclaimer: disclaimerSchema,
  emergency_numbers: emergencyNumbersSchema,
  visibility: z.enum(["private", "public"]).optional(),
});

export type Config = z.output<typeof configSchema>;
export type Project = z.output<typeof projectSchema>;
