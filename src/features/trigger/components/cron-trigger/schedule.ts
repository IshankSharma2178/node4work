import CronExpressionParser from "cron-parser";
import cronstrue from "cronstrue";

export type ScheduleKind = "preset" | "cron" | "interval";

export type CronSchedule = {
  id: string;
  kind: ScheduleKind;
  presetId?: "everyMinute" | "hourly" | "daily" | "weekly" | "monthly";
  minute?: number;
  hour?: number;
  dayOfWeek?: number[];
  dayOfMonth?: number;
  cronExpression?: string;
  every?: number;
  unit?: "minute" | "hour";
  timezone: string;
  startDate?: string;
  endDate?: string;
};

export type CronTriggerData = {
  schedules: CronSchedule[];
};

export const PRESET_CRONS: Record<
  NonNullable<CronSchedule["presetId"]>,
  { label: string; toCron: (s: CronSchedule) => string }
> = {
  everyMinute: {
    label: "Every minute",
    toCron: () => "* * * * *",
  },
  hourly: {
    label: "Hourly",
    toCron: () => "0 * * * *",
  },
  daily: {
    label: "Daily",
    toCron: (s) => `${s.minute ?? 0} ${s.hour ?? 0} * * *`,
  },
  weekly: {
    label: "Weekly",
    toCron: (s) =>
      `${s.minute ?? 0} ${s.hour ?? 0} * * ${
        s.dayOfWeek?.length ? s.dayOfWeek.join(",") : "*"
      }`,
  },
  monthly: {
    label: "Monthly",
    toCron: (s) => `${s.minute ?? 0} ${s.hour ?? 0} ${s.dayOfMonth ?? 1} * *`,
  },
};

export const scheduleToCron = (schedule: CronSchedule): string => {
  if (schedule.kind === "cron" && schedule.cronExpression) {
    return schedule.cronExpression;
  }

  if (schedule.kind === "interval") {
    const every = schedule.every ?? 1;
    const unit = schedule.unit ?? "minute";
    return unit === "hour" ? `0 */${every} * * *` : `*/${every} * * * *`;
  }

  const preset = PRESET_CRONS[schedule.presetId ?? "everyMinute"];
  return preset.toCron(schedule);
};

export const cronDescription = (schedule: CronSchedule): string | null => {
  if (schedule.kind === "interval") {
    const every = schedule.every ?? 1;
    const unit = schedule.unit ?? "minute";
    return `Every ${every} ${unit}${every > 1 ? "s" : ""}`;
  }

  try {
    return cronstrue.toString(scheduleToCron(schedule), {
      throwExceptionOnParseError: false,
    });
  } catch {
    return null;
  }
};

export const isValidCron = (expression: string): boolean => {
  try {
    CronExpressionParser.parse(expression);
    return true;
  } catch {
    return false;
  }
};
