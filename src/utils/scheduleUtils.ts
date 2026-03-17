/** Minimal shape needed by schedule utilities — structurally compatible with ScheduleEntry from branch.ts */
export interface ScheduleEntry {
  weekday: number;
  weekdayName: string;
  openTime: string;
  closeTime: string;
}

/**
 * Returns the schedule entry for the current weekday, or null if the branch
 * is closed on that day (i.e. no entry exists for it).
 * weekday follows JS Date.getDay(): 0 = Sunday, …, 6 = Saturday.
 */
export const getTodaySchedule = (
  schedules: ScheduleEntry[],
  now: Date = new Date()
): ScheduleEntry | null => {
  const today = now.getDay();
  return schedules.find((s) => s.weekday === today) ?? null;
};

/** Converts "HH:mm:ss" → "HH:mm" for display. */
const formatTime = (time: string): string => time.slice(0, 5);

const WEEKDAY_VI: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

/**
 * Returns a formatted hours string for today's schedule,
 * e.g. "06:00 - 22:00 (T2)".
 * Returns null if the branch has no schedule for today.
 */
export const formatTodayHours = (
  schedules: ScheduleEntry[],
  now: Date = new Date()
): string | null => {
  const schedule = getTodaySchedule(schedules, now);
  if (!schedule) return null;
  const day = WEEKDAY_VI[schedule.weekday] ?? schedule.weekdayName;
  return `${formatTime(schedule.openTime)} - ${formatTime(schedule.closeTime)} (${day})`;
};

/**
 * Parses a "HH:mm:ss" string and returns total minutes from midnight.
 */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/**
 * Returns true if the branch is currently open based on its work schedules
 * and the given time (defaults to now).
 */
export const isOpenNow = (
  schedules: ScheduleEntry[],
  now: Date = new Date()
): boolean => {
  const schedule = getTodaySchedule(schedules, now);
  if (!schedule) return false;

  const current = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(schedule.openTime);
  const close = toMinutes(schedule.closeTime);

  return current >= open && current < close;
};
