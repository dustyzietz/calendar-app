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
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
3. Leave `GOOGLE_CALENDAR_ID=primary` to target your main calendar.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.

## Google OAuth notes

The app expects an OAuth refresh token that can create and inspect events on your calendar. A common setup flow is:

1. Create OAuth credentials in Google Cloud.
2. Enable the Google Calendar API.
3. Generate a refresh token for the account whose primary calendar you want to manage.
4. Put those values into `.env.local`.

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
