import { google } from "googleapis";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().default("https://developers.google.com/oauthplayground"),
  GOOGLE_CALENDAR_ID: z.string().default("primary")
});

const env = envSchema.parse(process.env);

const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
oauth2Client.setCredentials({
  refresh_token: env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client
});

const server = new McpServer({
  name: "google-calendar-mcp",
  version: "0.1.0"
});

server.tool(
  "check_availability",
  {
    start: z.string(),
    end: z.string(),
    timezone: z.string()
  },
  async ({ start, end, timezone }) => {
    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(start).toISOString(),
        timeMax: new Date(end).toISOString(),
        timeZone: timezone,
        items: [{ id: env.GOOGLE_CALENDAR_ID }]
      }
    });

    const events = await calendar.events.list({
      calendarId: env.GOOGLE_CALENDAR_ID,
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const overlaps =
      events.data.items?.map((item) => ({
        id: item.id ?? `${item.iCalUID ?? "event"}-${item.start?.dateTime ?? item.start?.date ?? "unknown"}`,
        summary: item.summary ?? "Untitled event",
        start: item.start?.dateTime ?? item.start?.date ?? start,
        end: item.end?.dateTime ?? item.end?.date ?? end,
        htmlLink: item.htmlLink ?? undefined
      })) ?? [];

    const busySlots = freeBusy.data.calendars?.[env.GOOGLE_CALENDAR_ID]?.busy ?? [];
    const available = busySlots.length === 0;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            available,
            overlaps,
            requestedStart: start,
            requestedEnd: end,
            timezone
          })
        }
      ]
    };
  }
);

server.tool(
  "create_event",
  {
    summary: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    start: z.string(),
    end: z.string(),
    timezone: z.string()
  },
  async ({ summary, description, location, start, end, timezone }) => {
    const response = await calendar.events.insert({
      calendarId: env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary,
        description,
        location,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: timezone
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: timezone
        }
      }
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: response.data.id,
            htmlLink: response.data.htmlLink,
            summary: response.data.summary ?? summary,
            start: response.data.start?.dateTime ?? start,
            end: response.data.end?.dateTime ?? end
          })
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);
