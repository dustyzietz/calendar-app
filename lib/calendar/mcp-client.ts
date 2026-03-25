import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Readable } from "node:stream";

import { getEnv } from "@/lib/env";

type CalendarMcpClient = {
  client: Client;
  transport: StdioClientTransport;
};

declare global {
  var __calendarMcpClient: Promise<CalendarMcpClient> | undefined;
}

async function createClient(onClose: () => void): Promise<CalendarMcpClient> {
  const env = getEnv();
  const childEnv = Object.fromEntries(
    Object.entries({
      ...process.env,
      GOOGLE_SERVICE_ACCOUNT_JSON: env.GOOGLE_SERVICE_ACCOUNT_JSON,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN: env.GOOGLE_REFRESH_TOKEN,
      GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI,
      GOOGLE_CALENDAR_ID: env.GOOGLE_CALENDAR_ID
    }).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );

  const transport = new StdioClientTransport({
    command: env.MCP_SERVER_COMMAND,
    args: env.MCP_SERVER_ARGS.split(","),
    env: childEnv,
    stderr: "pipe"
  });

  const client = new Client({
    name: "calendar-app-web",
    version: "0.1.0"
  });

  const stderr = transport.stderr;

  if (stderr instanceof Readable) {
    stderr.setEncoding("utf8");
    stderr.on("data", (chunk) => {
      const message = chunk.toString().trim();

      if (message) {
        console.error(`[calendar-mcp] ${message}`);
      }
    });
  }

  transport.onclose = onClose;
  transport.onerror = (error) => {
    console.error("[calendar-mcp] transport error", error);
  };
  await client.connect(transport);
  client.onclose = onClose;
  client.onerror = (error) => {
    console.error("[calendar-mcp] client error", error);
  };

  return { client, transport };
}

function createCachedClientPromise() {
  const invalidateCache = () => {
    if (globalThis.__calendarMcpClient === promise) {
      globalThis.__calendarMcpClient = undefined;
    }
  };
  const promise = createClient(invalidateCache);

  promise
    .catch((error) => {
      invalidateCache();
      console.error("[calendar-mcp] failed to create client", error);
    });

  return promise;
}

export async function getCalendarMcpClient() {
  globalThis.__calendarMcpClient ??= createCachedClientPromise();

  return globalThis.__calendarMcpClient;
}

export async function resetCalendarMcpClient() {
  const currentClient = globalThis.__calendarMcpClient;
  globalThis.__calendarMcpClient = undefined;

  if (!currentClient) {
    return;
  }

  try {
    const { client, transport } = await currentClient;
    await Promise.allSettled([client.close(), transport.close()]);
  } catch (error) {
    console.error("[calendar-mcp] failed to reset client", error);
  }
}
