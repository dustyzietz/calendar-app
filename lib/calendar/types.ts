export type BookingInput = {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  notes?: string;
};

export type OverlapEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink?: string;
};

export type AvailabilityResponse = {
  available: boolean;
  overlaps: OverlapEvent[];
  requestedStart: string;
  requestedEnd: string;
  timezone: string;
};

export type CreateEventResponse = {
  id: string;
  htmlLink?: string;
  summary: string;
  start: string;
  end: string;
};
