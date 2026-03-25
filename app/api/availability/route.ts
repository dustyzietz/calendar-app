import { NextResponse } from "next/server";

import { bookingSchema } from "@/lib/calendar/schema";
import { checkAvailability } from "@/lib/calendar/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.parse(body);
    const availability = await checkAvailability(parsed);

    return NextResponse.json(availability);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check availability.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
