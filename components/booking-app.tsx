"use client";

import { useState } from "react";

import { formatDateTime } from "@/lib/calendar/datetime";
import type { AvailabilityResponse, CreateEventResponse } from "@/lib/calendar/types";

type FormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  notes: string;
  allowConflicts: boolean;
};

const defaultState: FormState = {
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "10:00",
  timezone: "Pacific/Honolulu",
  location: "",
  notes: "",
  allowConflicts: false
};

type ApiError = {
  error: string;
  overlaps?: AvailabilityResponse["overlaps"];
};

export function BookingApp() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CreateEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"check" | "book" | null>(null);

  const hasConflicts = (availability?.overlaps.length ?? 0) > 0;
  const stepLabel = availability ? "Review & confirm" : "Check availability";

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAvailabilityCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("check");
    setError(null);
    setCreatedEvent(null);

    const response = await fetch("/api/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const payload = (await response.json()) as AvailabilityResponse | ApiError;

    if (!response.ok) {
      setAvailability(null);
      setError("error" in payload ? payload.error : "Unable to check availability.");
      setBusyAction(null);
      return;
    }

    setAvailability(payload as AvailabilityResponse);
    setBusyAction(null);
  }

  async function handleBooking(force = false) {
    setBusyAction("book");
    setError(null);

    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        allowConflicts: force
      })
    });

    const payload = (await response.json()) as { event: CreateEventResponse; availability: AvailabilityResponse } | ApiError;

    if (!response.ok) {
      setError("error" in payload ? payload.error : "Unable to create the event.");
      setBusyAction(null);
      return;
    }

    setCreatedEvent((payload as { event: CreateEventResponse }).event);
    setBusyAction(null);
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-base-300/80 bg-base-100/90 p-6 shadow-glow backdrop-blur lg:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="badge badge-secondary badge-lg rounded-full border-none px-4 py-3 text-neutral">
                Internal booking desk
              </span>
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral sm:text-5xl">
                  Book time on your calendar without leaving the app.
                </h1>
                <p className="mt-3 max-w-2xl text-base text-neutral/75 sm:text-lg">
                  Check availability first, review any overlaps by name and time, then book anyway when the schedule needs a little flexibility.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-neutral">
              <div className="font-semibold">Default timezone</div>
              <div>{form.timezone}</div>
            </div>
          </div>

          <form className="grid gap-5" onSubmit={handleAvailabilityCheck}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="form-control md:col-span-2">
                <span className="label-text mb-2 font-medium text-neutral">Title</span>
                <input
                  className="input input-bordered w-full rounded-2xl border-base-300 bg-base-100"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Quarterly planning session"
                  required
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text mb-2 font-medium text-neutral">Description</span>
                <textarea
                  className="textarea textarea-bordered min-h-28 rounded-2xl border-base-300 bg-base-100"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Why this meeting is happening and what you need covered."
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">Date</span>
                <input
                  type="date"
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">Timezone</span>
                <input
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.timezone}
                  onChange={(event) => updateField("timezone", event.target.value)}
                  placeholder="Pacific/Honolulu"
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">Start time</span>
                <input
                  type="time"
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">End time</span>
                <input
                  type="time"
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">Location</span>
                <input
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Zoom or conference room"
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-2 font-medium text-neutral">Notes</span>
                <input
                  className="input input-bordered rounded-2xl border-base-300 bg-base-100"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Internal notes appended to the event."
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <button className="btn btn-primary rounded-full px-6 text-base text-base-100" disabled={busyAction !== null} type="submit">
                {busyAction === "check" ? "Checking..." : "Check availability"}
              </button>
              <button
                className="btn btn-ghost rounded-full px-6 text-base text-neutral"
                disabled={busyAction !== null}
                type="button"
                onClick={() => {
                  setForm(defaultState);
                  setAvailability(null);
                  setCreatedEvent(null);
                  setError(null);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-neutral/10 bg-neutral p-6 text-base-100 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-base-100/65">Step 2</p>
                <h2 className="font-display text-2xl font-semibold">{stepLabel}</h2>
              </div>
              <div className={`badge rounded-full border-none px-4 py-3 ${availability ? "badge-secondary text-neutral" : "badge-ghost text-base-100/70"}`}>
                {availability ? "Ready" : "Waiting"}
              </div>
            </div>

            {!availability ? (
              <p className="text-base leading-7 text-base-100/75">
                Run an availability check to see whether the slot is open, then review overlap details before you create the event.
              </p>
            ) : (
              <div className="space-y-5">
                <div className={`rounded-3xl p-4 ${hasConflicts ? "bg-warning/20 text-warning-content" : "bg-success/20 text-base-100"}`}>
                  <div className="text-sm uppercase tracking-[0.2em] opacity-75">Availability status</div>
                  <div className="mt-2 text-xl font-semibold">
                    {hasConflicts ? "Conflicts found, but you can still book." : "This slot looks open."}
                  </div>
                  <p className="mt-2 text-sm opacity-80">
                    {formatDateTime(availability.requestedStart, availability.timezone)} to{" "}
                    {formatDateTime(availability.requestedEnd, availability.timezone)}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Overlapping events</h3>
                  {availability.overlaps.length === 0 ? (
                    <div className="rounded-3xl border border-success/30 bg-success/10 p-4 text-sm text-base-100/85">
                      No overlapping events were found on your calendar.
                    </div>
                  ) : (
                    availability.overlaps.map((overlap) => (
                      <div key={overlap.id} className="rounded-3xl border border-warning/30 bg-base-100/10 p-4">
                        <div className="font-semibold">{overlap.summary}</div>
                        <div className="mt-1 text-sm text-base-100/75">
                          {formatDateTime(overlap.start, availability.timezone)} to {formatDateTime(overlap.end, availability.timezone)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn btn-secondary rounded-full px-6 text-neutral" disabled={busyAction !== null} onClick={() => handleBooking(false)} type="button">
                    {busyAction === "book" ? "Booking..." : "Book event"}
                  </button>
                  {hasConflicts ? (
                    <button className="btn btn-outline rounded-full px-6 text-base-100" disabled={busyAction !== null} onClick={() => handleBooking(true)} type="button">
                      Book anyway
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-base-300/80 bg-base-100/90 p-6 shadow-glow">
            <h2 className="font-display text-2xl font-semibold text-neutral">Booking result</h2>
            {createdEvent ? (
              <div className="mt-4 space-y-3 rounded-3xl border border-success/30 bg-success/10 p-4 text-sm text-neutral">
                <p className="font-semibold">Event created successfully.</p>
                <p>{createdEvent.summary}</p>
                <p>
                  {formatDateTime(createdEvent.start, form.timezone)} to {formatDateTime(createdEvent.end, form.timezone)}
                </p>
                {createdEvent.htmlLink ? (
                  <a className="link link-hover text-primary" href={createdEvent.htmlLink} rel="noreferrer" target="_blank">
                    Open in Google Calendar
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-neutral/70">
                After you confirm the booking, the created event will show up here with a direct Google Calendar link.
              </p>
            )}

            {error ? (
              <div className="mt-4 rounded-3xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                {error}
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}
