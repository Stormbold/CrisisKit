import { z } from "zod";

export const medicationItemSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const medicationPersonSchema = z.object({
  name: z.string().min(1),
  items: z.array(medicationItemSchema).default([]),
});

export const medicationSchema = z.object({
  disclaimer: z.string().optional(),
  persons: z.array(medicationPersonSchema).default([]),
});

export type Medication = z.output<typeof medicationSchema>;
export type MedicationPerson = z.output<typeof medicationPersonSchema>;
