import { z } from "zod";

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export const bookingSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().optional().default(""),
    date: z.string().min(1, "Date is required."),
    startTime: z.string().refine(isValidTime, "Start time must use HH:MM."),
    endTime: z.string().refine(isValidTime, "End time must use HH:MM."),
    timezone: z.string().trim().min(1, "Timezone is required."),
    location: z.string().trim().optional().default(""),
    notes: z.string().trim().optional().default(""),
    allowConflicts: z.boolean().optional().default(false)
  })
  .superRefine((value, ctx) => {
    const start = new Date(`${value.date}T${value.startTime}:00`);
    const end = new Date(`${value.date}T${value.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date and time must be valid."
      });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after the start time."
      });
    }
  });

export type BookingSchema = z.infer<typeof bookingSchema>;
