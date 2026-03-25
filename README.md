# Calendar Booking App

A Next.js booking tool that checks your Google Calendar availability and creates events through a local Model Context Protocol (MCP) server.

The app is built for a simple internal flow:

- enter meeting details
- check the requested time window for overlaps
- review conflicting events, if any
- create the event or force the booking anyway

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS + DaisyUI
- Google Calendar API via `googleapis`
- Local MCP server over stdio using `@modelcontextprotocol/sdk`

## What The App Does

The UI collects:

- title
- description
- date
- start and end times
- timezone
- location
- notes

When you check availability, the app:

1. sends the form payload to `POST /api/availability`
2. validates the request with Zod
3. calls the local calendar MCP server
4. checks the target Google Calendar for overlapping events

When you book, the app:

1. sends the same payload to `POST /api/book`
2. blocks the booking with `409` if conflicts exist and `allowConflicts` is not enabled
3. creates the event if the slot is open, or if you explicitly choose "Book anyway"

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in Google Calendar credentials using one of the supported auth methods.

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The app validates its environment at runtime in [`lib/env.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/lib/env.ts).

You must provide either:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- or all three OAuth values:
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

Available variables:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: Raw JSON string for a Google service account
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret
- `GOOGLE_REFRESH_TOKEN`: OAuth refresh token for the calendar owner
- `GOOGLE_REDIRECT_URI`: Defaults to `https://developers.google.com/oauthplayground`
- `GOOGLE_CALENDAR_ID`: Defaults to `primary`
- `DEFAULT_BOOKING_TIMEZONE`: Defaults to `Pacific/Honolulu`
- `MCP_SERVER_COMMAND`: Defaults to `npx`
- `MCP_SERVER_ARGS`: Defaults to `tsx,mcp/calendar-server.ts`

See [`.env.example`](/Users/dustyzietz/Desktop/DEMO/calendar-app/.env.example) for the current template.

## Google Calendar Auth Notes

Two auth modes are supported:

- OAuth refresh token flow
- service account JSON

OAuth is usually the easiest option for a personal primary calendar.

Service account access only works when the target calendar is shared with the service account, or when you are using Google Workspace with domain-wide delegation. A personal primary calendar will not usually work with a service account unless that calendar has been explicitly shared to the service account identity.

## Architecture

The request flow looks like this:

```text
Next.js UI
  -> app/api/availability or app/api/book
  -> lib/calendar/service.ts
  -> lib/calendar/mcp-client.ts
  -> mcp/calendar-server.ts
  -> Google Calendar API
```

Key files:

- [`components/booking-app.tsx`](/Users/dustyzietz/Desktop/DEMO/calendar-app/components/booking-app.tsx): main booking interface
- [`app/api/availability/route.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/app/api/availability/route.ts): availability endpoint
- [`app/api/book/route.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/app/api/book/route.ts): booking endpoint
- [`lib/calendar/service.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/lib/calendar/service.ts): app-level calendar operations
- [`lib/calendar/mcp-client.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/lib/calendar/mcp-client.ts): stdio MCP client launcher
- [`mcp/calendar-server.ts`](/Users/dustyzietz/Desktop/DEMO/calendar-app/mcp/calendar-server.ts): Google Calendar-backed MCP server

## API Behavior

### `POST /api/availability`

Checks the requested time window and returns:

- `available`: whether Google Calendar reported the range as free
- `overlaps`: matching events in that window
- `requestedStart`
- `requestedEnd`
- `timezone`

### `POST /api/book`

Creates an event and returns:

- `event`: created event metadata
- `availability`: the overlap check that ran before booking

If overlaps exist and `allowConflicts` is false, the route responds with `409` and the overlap details instead of creating the event.

## Scripts

- `npm run dev`: start the Next.js dev server
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript without emitting files
- `npm run mcp:calendar`: run the calendar MCP server directly

## Notes

- The booking form defaults to the current date and `Pacific/Honolulu` unless you change the timezone in the UI.
- The MCP client is cached globally, so the app does not spawn a fresh child process for every request during a running server session.
- Notes entered in the UI are appended to the Google Calendar event description.
