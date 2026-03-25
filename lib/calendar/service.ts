import { getCalendarMcpClient, resetCalendarMcpClient } from "@/lib/calendar/mcp-client";
import { toIsoStringInTimezone } from "@/lib/calendar/datetime";
import type { AvailabilityResponse, BookingInput, CreateEventResponse } from "@/lib/calendar/types";

type ContentResult = {
  content: Array<{ type: string; text?: string }>;
};

function hasContent(value: unknown): value is ContentResult {
  return typeof value === "object" && value !== null && "content" in value;
}

function parseToolText(result: unknown) {
  const contentResult = hasContent(result)
    ? result
    : hasContent((result as { toolResult?: unknown })?.toolResult)
      ? (result as { toolResult: ContentResult }).toolResult
      : null;

  if (!contentResult) {
    throw new Error("Calendar MCP server returned an unexpected response.");
  }

  const text = contentResult.content.find((item) => item.type === "text" && typeof item.text === "string");

  if (!text?.text) {
    throw new Error("Calendar MCP server returned an unexpected response.");
  }

  return text.text;
}

function isConnectionClosedError(error: unknown) {
  return error instanceof Error && /connection closed/i.test(error.message);
}

async function callCalendarTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  try {
    const { client } = await getCalendarMcpClient();
    const result = await client.callTool({
      name,
      arguments: args
    });

    return JSON.parse(parseToolText(result)) as T;
  } catch (error) {
    if (!isConnectionClosedError(error)) {
      throw error;
    }

    await resetCalendarMcpClient();

    const { client } = await getCalendarMcpClient();
    const result = await client.callTool({
      name,
      arguments: args
    });

    return JSON.parse(parseToolText(result)) as T;
  }
}

export async function checkAvailability(input: BookingInput): Promise<AvailabilityResponse> {
  return callCalendarTool<AvailabilityResponse>("check_availability", {
      start: toIsoStringInTimezone(input.date, input.startTime, input.timezone),
      end: toIsoStringInTimezone(input.date, input.endTime, input.timezone),
      timezone: input.timezone
  });
}

export async function createEvent(input: BookingInput): Promise<CreateEventResponse> {
  return callCalendarTool<CreateEventResponse>("create_event", {
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
