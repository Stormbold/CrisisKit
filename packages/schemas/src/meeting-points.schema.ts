import { z } from "zod";

export const meetingPointSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  when: z.string().optional(),
  notes: z.string().optional(),
});

export const meetingPointsSchema = z.object({
  meeting_points: z.array(meetingPointSchema).default([]),
});

export type MeetingPoint = z.output<typeof meetingPointSchema>;
export type MeetingPoints = z.output<typeof meetingPointsSchema>;
