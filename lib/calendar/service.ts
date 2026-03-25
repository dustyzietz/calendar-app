import { toIsoStringInTimezone } from "@/lib/calendar/datetime";
import { checkAvailabilityWithGoogle, createGoogleCalendarEvent } from "@/lib/calendar/google-calendar";
import type { AvailabilityResponse, BookingInput, CreateEventResponse } from "@/lib/calendar/types";

export async function checkAvailability(input: BookingInput): Promise<AvailabilityResponse> {
  return checkAvailabilityWithGoogle({
    start: toIsoStringInTimezone(input.date, input.startTime, input.timezone),
    end: toIsoStringInTimezone(input.date, input.endTime, input.timezone),
    timezone: input.timezone
  });
}

export async function createEvent(input: BookingInput): Promise<CreateEventResponse> {
  return createGoogleCalendarEvent({
    summary: input.title,
    description: [input.description, input.notes ? `Notes: ${input.notes}` : ""]
      .filter(Boolean)
      .join("\n\n"),
    location: input.location,
    start: toIsoStringInTimezone(input.date, input.startTime, input.timezone),
    end: toIsoStringInTimezone(input.date, input.endTime, input.timezone),
    timezone: input.timezone
  });
}
