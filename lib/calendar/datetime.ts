import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export function toIsoStringInTimezone(date: string, time: string, timezone: string) {
  const input = `${date}T${time}:00`;
  const utcDate = fromZonedTime(input, timezone);

  if (Number.isNaN(utcDate.getTime())) {
    throw new Error("Invalid date or time.");
  }

  return utcDate.toISOString();
}

export function formatDateTime(value: string, timezone: string) {
  return formatInTimeZone(new Date(value), timezone, "MMM d, yyyy 'at' h:mm a zzz");
}
