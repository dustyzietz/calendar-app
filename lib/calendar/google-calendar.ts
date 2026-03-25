import { google } from "googleapis";
import { z } from "zod";

import { getEnv } from "@/lib/env";
import type { AvailabilityResponse, CreateEventResponse } from "@/lib/calendar/types";

const serviceAccountSchema = z.object({
  client_email: z.string().email(),
  private_key: z.string().min(1)
});

let calendarClient: ReturnType<typeof google.calendar> | null = null;

function getCalendarClient() {
  if (calendarClient) {
    return calendarClient;
  }

  const env = getEnv();

  calendarClient = google.calendar({
    version: "v3",
    auth: (() => {
      if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        const credentials = serviceAccountSchema.parse(JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON));

        return new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ["https://www.googleapis.com/auth/calendar"]
        });
      }

      const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
      oauth2Client.setCredentials({
        refresh_token: env.GOOGLE_REFRESH_TOKEN
      });

      return oauth2Client;
    })()
  });

  return calendarClient;
}

function formatCalendarError(error: unknown) {
  const gaxiosError = error as {
    response?: {
      status?: number;
      data?: {
        error?: {
          message?: string;
        };
      };
    };
    message?: string;
  };

  const apiMessage = gaxiosError.response?.data?.error?.message;

  if (apiMessage) {
    return apiMessage;
  }

  if (typeof gaxiosError.response?.status === "number" && gaxiosError.message) {
    return `Google Calendar request failed (${gaxiosError.response.status}): ${gaxiosError.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to reach Google Calendar.";
}

export async function checkAvailabilityWithGoogle(input: {
  start: string;
  end: string;
  timezone: string;
}): Promise<AvailabilityResponse> {
  const calendar = getCalendarClient();
  const env = getEnv();

  try {
    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(input.start).toISOString(),
        timeMax: new Date(input.end).toISOString(),
        timeZone: input.timezone,
        items: [{ id: env.GOOGLE_CALENDAR_ID }]
      }
    });

    const events = await calendar.events.list({
      calendarId: env.GOOGLE_CALENDAR_ID,
      timeMin: new Date(input.start).toISOString(),
      timeMax: new Date(input.end).toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const overlaps =
      events.data.items?.map((item) => ({
        id: item.id ?? `${item.iCalUID ?? "event"}-${item.start?.dateTime ?? item.start?.date ?? "unknown"}`,
        summary: item.summary ?? "Untitled event",
        start: item.start?.dateTime ?? item.start?.date ?? input.start,
        end: item.end?.dateTime ?? item.end?.date ?? input.end,
        htmlLink: item.htmlLink ?? undefined
      })) ?? [];

    const busySlots = freeBusy.data.calendars?.[env.GOOGLE_CALENDAR_ID]?.busy ?? [];

    return {
      available: busySlots.length === 0,
      overlaps,
      requestedStart: input.start,
      requestedEnd: input.end,
      timezone: input.timezone
    };
  } catch (error) {
    throw new Error(formatCalendarError(error));
  }
}

export async function createGoogleCalendarEvent(input: {
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  timezone: string;
}): Promise<CreateEventResponse> {
  const calendar = getCalendarClient();
  const env = getEnv();

  try {
    const response = await calendar.events.insert({
      calendarId: env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: {
          dateTime: new Date(input.start).toISOString(),
          timeZone: input.timezone
        },
        end: {
          dateTime: new Date(input.end).toISOString(),
          timeZone: input.timezone
        }
      }
    });

    return {
      id: response.data.id ?? "unknown-event",
      htmlLink: response.data.htmlLink ?? undefined,
      summary: response.data.summary ?? input.summary,
      start: response.data.start?.dateTime ?? input.start,
      end: response.data.end?.dateTime ?? input.end
    };
  } catch (error) {
    throw new Error(formatCalendarError(error));
  }
}
