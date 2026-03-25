import { z } from "zod";

const envSchema = z
  .object({
    GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REFRESH_TOKEN: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().default("https://developers.google.com/oauthplayground"),
    GOOGLE_CALENDAR_ID: z.string().default("primary"),
    DEFAULT_BOOKING_TIMEZONE: z.string().default("Pacific/Honolulu"),
    MCP_SERVER_COMMAND: z.string().default("npx"),
    MCP_SERVER_ARGS: z.string().default("tsx,mcp/calendar-server.ts")
  })
  .superRefine((value, ctx) => {
    const hasServiceAccount = Boolean(value.GOOGLE_SERVICE_ACCOUNT_JSON);
    const hasOAuth =
      Boolean(value.GOOGLE_CLIENT_ID) &&
      Boolean(value.GOOGLE_CLIENT_SECRET) &&
      Boolean(value.GOOGLE_REFRESH_TOKEN);

    if (!hasServiceAccount && !hasOAuth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide either GOOGLE_SERVICE_ACCOUNT_JSON or the OAuth trio GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN."
      });
    }
  });

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
