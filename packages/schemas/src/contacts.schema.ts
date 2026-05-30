import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().min(1),
  priority: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
  public: z.boolean().optional(),
});

export const contactsSchema = z.object({
  contacts: z.array(contactSchema).default([]),
});

export type Contact = z.output<typeof contactSchema>;
export type Contacts = z.output<typeof contactsSchema>;
