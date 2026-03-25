import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().default("https://developers.google.com/oauthplayground"),
  GOOGLE_CALENDAR_ID: z.string().default("primary"),
  DEFAULT_BOOKING_TIMEZONE: z.string().default("Pacific/Honolulu"),
  MCP_SERVER_COMMAND: z.string().default("npx"),
  MCP_SERVER_ARGS: z.string().default("tsx,mcp/calendar-server.ts")
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
