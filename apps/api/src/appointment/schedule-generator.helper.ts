export interface GeneratedSlot {
  startsAt: Date;
  endsAt: Date;
}

const DAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

/**
 * Expands a schedule's recurrence rule into rolling discrete appointment slots.
 * Supports standard RRULE formats like:
 * - "FREQ=WEEKLY;BYDAY=MO,WE,FR"
 * - "FREQ=DAILY"
 * - "WEEKLY:MO,TH"
 * - "MO,WE"
 */
export function generateScheduleSlots(
  recurrenceRule: string,
  startTimeStr: string, // e.g. "10:00" or "10:30:00"
  durationMinutes: number,
  startsOn: Date,
  endsOn?: Date | null,
  windowWeeks = 8,
): GeneratedSlot[] {
  const [hoursStr, minutesStr] = startTimeStr.split(':');
  const hours = parseInt(hoursStr, 10) || 10;
  const minutes = parseInt(minutesStr, 10) || 0;

  const ruleUpper = recurrenceRule.toUpperCase();
  const isDaily = ruleUpper.includes('FREQ=DAILY') || ruleUpper === 'DAILY';

  // Parse days of week if weekly
  let targetDays: number[] = [];
  if (!isDaily) {
    let byDayPart = '';
    if (ruleUpper.includes('BYDAY=')) {
      const match = ruleUpper.match(/BYDAY=([A-Z,]+)/);
      byDayPart = match ? match[1] : '';
    } else if (ruleUpper.includes(':')) {
      byDayPart = ruleUpper.split(':')[1];
    } else {
      byDayPart = ruleUpper;
    }

    const tokens = byDayPart.split(',').map((t) => t.trim());
    targetDays = tokens
      .map((tok) => DAY_MAP[tok.slice(-2)])
      .filter((d): d is number => d !== undefined);

    if (targetDays.length === 0) {
      // Default to the startsOn day of week if no valid day specified
      targetDays = [startsOn.getUTCDay()];
    }
  }

  const startDate = new Date(startsOn);
  startDate.setUTCHours(0, 0, 0, 0);

  const windowLimit = new Date(startDate.getTime() + windowWeeks * 7 * 24 * 60 * 60 * 1000);
  const cutoffDate = endsOn && endsOn < windowLimit ? new Date(endsOn) : windowLimit;

  const slots: GeneratedSlot[] = [];
  const current = new Date(startDate);

  while (current <= cutoffDate) {
    const dayOfWeek = current.getUTCDay();

    if (isDaily || targetDays.includes(dayOfWeek)) {
      const slotStart = new Date(
        Date.UTC(
          current.getUTCFullYear(),
          current.getUTCMonth(),
          current.getUTCDate(),
          hours,
          minutes,
          0,
          0,
        ),
      );

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

      slots.push({
        startsAt: slotStart,
        endsAt: slotEnd,
      });
    }

    // Advance 1 day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return slots;
}
