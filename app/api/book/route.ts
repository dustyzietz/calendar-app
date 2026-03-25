import { NextResponse } from "next/server";

import { bookingSchema } from "@/lib/calendar/schema";
import { checkAvailability, createEvent } from "@/lib/calendar/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.parse(body);
    const availability = await checkAvailability(parsed);

    if (!parsed.allowConflicts && availability.overlaps.length > 0) {
      return NextResponse.json(
        {
          error: "This time has conflicts. Review the overlaps and confirm booking anyway if you still want to continue.",
          overlaps: availability.overlaps
        },
        { status: 409 }
      );
    }

    const event = await createEvent(parsed);
    return NextResponse.json({ event, availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
