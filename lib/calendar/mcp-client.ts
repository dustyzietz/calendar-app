import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { getEnv } from "@/lib/env";

type CalendarMcpClient = {
  client: Client;
  transport: StdioClientTransport;
};

declare global {
  var __calendarMcpClient: Promise<CalendarMcpClient> | undefined;
}

async function createClient(): Promise<CalendarMcpClient> {
  const env = getEnv();
  const transport = new StdioClientTransport({
    command: env.MCP_SERVER_COMMAND,
    args: env.MCP_SERVER_ARGS.split(","),
    env: {
      ...process.env,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN: env.GOOGLE_REFRESH_TOKEN,
      GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI,
      GOOGLE_CALENDAR_ID: env.GOOGLE_CALENDAR_ID
    }
  });

  const client = new Client({
    name: "calendar-app-web",
    version: "0.1.0"
  });

  await client.connect(transport);

  return { client, transport };
}

export async function getCalendarMcpClient() {
  globalThis.__calendarMcpClient ??= createClient();
  return globalThis.__calendarMcpClient;
}
