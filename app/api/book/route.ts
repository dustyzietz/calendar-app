import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to create event.";
    console.error("[book] request failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
