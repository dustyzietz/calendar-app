# Calendar Booking App

Internal Next.js booking tool that starts a local Google Calendar MCP server as a child process, checks availability on your primary calendar, and creates events with an optional "book anyway" flow when overlaps exist.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS + DaisyUI
- Google Calendar API
- Local MCP server launched over stdio

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Google Calendar OAuth credentials:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` for service-account auth
   - or the OAuth values below
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
3. Leave `GOOGLE_CALENDAR_ID=primary` to target your main calendar.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.

## Google auth notes

The app supports either:

- a service account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON`
- or an OAuth refresh token flow

A common OAuth setup flow is:

1. Create OAuth credentials in Google Cloud.
2. Enable the Google Calendar API.
3. Generate a refresh token for the account whose primary calendar you want to manage.
4. Put those values into `.env.local`.

For service accounts, Google Calendar access works only if the target calendar is explicitly shared with the service account, or if you are in Google Workspace and using domain-wide delegation. A plain personal primary calendar usually cannot be accessed by a service account unless you share that calendar with the service account address and target that shared calendar ID.

## How it works

- The web app calls internal route handlers in `app/api`.
- Those route handlers use the MCP client in `lib/calendar/mcp-client.ts`.
- The MCP client launches `mcp/calendar-server.ts` as a local child process.
- The MCP server talks to Google Calendar using the official `googleapis` package.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run mcp:calendar`
