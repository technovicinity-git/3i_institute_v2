// e.g. "Mon, 13 Oct 2026, 7:05 PM GMT+6" in the recipient's timezone.
export function formatDateTime(date: Date, timeZone = "UTC"): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    // Unknown timezone string stored on the user.
    return timeZone === "UTC" ? date.toUTCString() : formatDateTime(date);
  }
}
