// Calendar maths in a given IANA timezone (e.g. "Asia/Dhaka"), without a
// date library. Used to end subscriptions at 12am local time.

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Milliseconds the zone is ahead of UTC at `date`. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant a local wall-clock time occurs in the zone. */
function zonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  let result = guess - zoneOffsetMs(new Date(guess), timeZone);
  // Re-check once in case the offset differs at the result (DST change)
  result = guess - zoneOffsetMs(new Date(result), timeZone);
  return new Date(result);
}

function zonedMidnight(year: number, month: number, day: number, timeZone: string) {
  return zonedTime(year, month, day, 0, 0, 0, timeZone);
}

/** Adds one calendar month in the zone, clamping to the month's last day. */
export function addOneMonth(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const year = p.month === 12 ? p.year + 1 : p.year;
  const month = p.month === 12 ? 1 : p.month + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return zonedTime(
    year,
    month,
    Math.min(p.day, lastDay),
    p.hour,
    p.minute,
    p.second,
    timeZone,
  );
}

/** The first local 12am at or after `date`. */
export function midnightAtOrAfter(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const sameDay = zonedMidnight(p.year, p.month, p.day, timeZone);
  if (sameDay.getTime() >= date.getTime()) return sameDay;
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
  return zonedMidnight(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    timeZone,
  );
}

/**
 * End of a one-month subscription that starts at `start`: one calendar month
 * later, rounded up to the next local 12am. Approved Oct 15 3pm → ends at
 * 12am on Nov 16. A renewal that starts at 12am Nov 16 ends at 12am Dec 16.
 */
export function oneMonthPeriodEnd(start: Date, timeZone: string): Date {
  return midnightAtOrAfter(addOneMonth(start, timeZone), timeZone);
}
