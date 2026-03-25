import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { checkAvailabilityWithGoogle, createGoogleCalendarEvent } from "@/lib/calendar/google-calendar";

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
    const result = await checkAvailabilityWithGoogle({ start, end, timezone });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
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
    const result = await createGoogleCalendarEvent({ summary, description, location, start, end, timezone });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
