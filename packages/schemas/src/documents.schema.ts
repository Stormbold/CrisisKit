import { z } from "zod";

export const documentSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  original_or_copy: z.enum(["original", "copy", "both", "digital"]).optional(),
  notes: z.string().optional(),
});

export const documentsSchema = z.object({
  documents: z.array(documentSchema).default([]),
});

export type Document = z.output<typeof documentSchema>;
export type Documents = z.output<typeof documentsSchema>;
