import type { Period } from "./types";

const TZ_OFFSET_HOURS = 3; // Africa/Kampala = UTC+3, no DST

/**
 * Given a Date, return a Date representing midnight local (Uganda)
 * on that same local day, expressed in UTC.
 */
function localMidnightUTC(y: number, m: number, d: number): Date {
  // Local midnight is 3 hours behind UTC midnight
  return new Date(Date.UTC(y, m, d, -TZ_OFFSET_HOURS, 0, 0));
}

/**
 * Extract local (Uganda) y/m/d from any Date.
 */
function localYMD(date: Date) {
  const shifted = new Date(date.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
  };
}

export function todayPeriod(): Period {
  const now = new Date();
  const { y, m, d } = localYMD(now);
  const from = localMidnightUTC(y, m, d);
  const to = localMidnightUTC(y, m, d + 1);
  return { from, to, label: "Today" };
}

export function yesterdayPeriod(): Period {
  const now = new Date();
  const { y, m, d } = localYMD(now);
  const from = localMidnightUTC(y, m, d - 1);
  const to = localMidnightUTC(y, m, d);
  return { from, to, label: "Yesterday" };
}

export function last7DaysPeriod(): Period {
  const now = new Date();
  const { y, m, d } = localYMD(now);
  const from = localMidnightUTC(y, m, d - 6);
  const to = localMidnightUTC(y, m, d + 1);
  return { from, to, label: "Last 7 days" };
}

export function thisWeekPeriod(): Period {
  // Week starts Monday
  const now = new Date();
  const { y, m, d } = localYMD(now);
  const local = new Date(Date.UTC(y, m, d));
  const day = local.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diffToMon = (day + 6) % 7;
  const from = localMidnightUTC(y, m, d - diffToMon);
  const to = localMidnightUTC(y, m, d + 1);
  return { from, to, label: "This week" };
}

export function thisMonthPeriod(): Period {
  const now = new Date();
  const { y, m } = localYMD(now);
  const from = localMidnightUTC(y, m, 1);
  const to = localMidnightUTC(y, m + 1, 1);
  return { from, to, label: "This month" };
}

export function lastMonthPeriod(): Period {
  const now = new Date();
  const { y, m } = localYMD(now);
  const from = localMidnightUTC(y, m - 1, 1);
  const to = localMidnightUTC(y, m, 1);
  return { from, to, label: "Last month" };
}

export function thisYearPeriod(): Period {
  const now = new Date();
  const { y } = localYMD(now);
  const from = localMidnightUTC(y, 0, 1);
  const to = localMidnightUTC(y + 1, 0, 1);
  return { from, to, label: "This year" };
}

/**
 * Custom range from YYYY-MM-DD strings (inclusive).
 */
export function customPeriod(fromStr: string, toStr: string): Period {
  const [fy, fm, fd] = fromStr.split("-").map(Number);
  const [ty, tm, td] = toStr.split("-").map(Number);
  const from = localMidnightUTC(fy, fm - 1, fd);
  const to = localMidnightUTC(ty, tm - 1, td + 1);
  return {
    from,
    to,
    label: `${fromStr} → ${toStr}`,
  };
}

export function resolvePeriod(
  preset: string | undefined,
  from?: string,
  to?: string
): Period {
  if (from && to) return customPeriod(from, to);
  switch (preset) {
    case "yesterday":
      return yesterdayPeriod();
    case "7d":
      return last7DaysPeriod();
    case "week":
      return thisWeekPeriod();
    case "month":
      return thisMonthPeriod();
    case "last-month":
      return lastMonthPeriod();
    case "year":
      return thisYearPeriod();
    default:
      return todayPeriod();
  }
}
