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

// "Aisha", "Aisha and Yusuf", "Aisha, Yusuf and Musa"
export function formatNameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

// "45 minutes", "1 hour", "1 hour 30 minutes"
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [
    hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
    rest ? `${rest} ${rest === 1 ? "minute" : "minutes"}` : "",
  ].filter(Boolean);
  return parts.join(" ") || "0 minutes";
}
