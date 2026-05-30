import { z } from "zod";

export const checklistSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.string().min(1)).min(1),
});

export const checklistsSchema = z.object({
  checklists: z.array(checklistSchema).default([]),
});

export type Checklist = z.output<typeof checklistSchema>;
export type Checklists = z.output<typeof checklistsSchema>;
