import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  carrier_location: z.string().optional(),
  food: z.string().optional(),
  vet: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

export const petsSchema = z.object({
  pets: z.array(petSchema).default([]),
});

export type Pet = z.output<typeof petSchema>;
export type Pets = z.output<typeof petsSchema>;
