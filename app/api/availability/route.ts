import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { bookingSchema } from "@/lib/calendar/schema";
import { checkAvailability } from "@/lib/calendar/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.parse(body);
    const availability = await checkAvailability(parsed);

    return NextResponse.json(availability);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to check availability.";
    console.error("[availability] request failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
