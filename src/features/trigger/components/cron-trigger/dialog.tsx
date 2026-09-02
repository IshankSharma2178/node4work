"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClockIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CronSchedule,
  cronDescription,
  isValidCron,
  PRESET_CRONS,
} from "./schedule";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "America/New_York", label: "America/New_York (ET)" },
  { value: "America/Chicago", label: "America/Chicago (CT)" },
  { value: "America/Denver", label: "America/Denver (MT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const PRESET_OPTIONS = Object.entries(PRESET_CRONS).map(([key, val]) => ({
  id: key,
  label: val.label,
}));

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const scheduleSchema = z.object({
  id: z.string(),
  kind: z.enum(["preset", "cron", "interval"]),
  presetId: z.string().optional(),
  minute: z.coerce.number().int().min(0).max(59).optional(),
  hour: z.coerce.number().int().min(0).max(23).optional(),
  dayOfWeek: z.array(z.coerce.number()).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  cronExpression: z.string().optional(),
  every: z.coerce.number().int().min(1).max(999).optional(),
  unit: z.enum(["minute", "hour"]).optional(),
  timezone: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const dialogSchema = z.object({
  schedules: z.array(scheduleSchema).min(1),
});

type DialogFormValues = z.infer<typeof dialogSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateSchedule(
  schedule: Partial<z.infer<typeof scheduleSchema>>,
): string | null {
  if (schedule.kind === "cron") {
    if (!schedule.cronExpression) return "Cron expression is required";
    if (!isValidCron(schedule.cronExpression)) return "Invalid cron expression";
  }

  if (schedule.kind === "preset") {
    if (!schedule.presetId) return "Please select a schedule type";
    if (
      schedule.presetId === "daily" ||
      schedule.presetId === "weekly" ||
      schedule.presetId === "monthly"
    ) {
      if (schedule.hour === undefined || schedule.minute === undefined)
        return "Please set hour and minute";
    }
    if (schedule.presetId === "weekly") {
      if (!schedule.dayOfWeek || schedule.dayOfWeek.length === 0)
        return "Please select at least one day";
    }
    if (schedule.presetId === "monthly") {
      if (!schedule.dayOfMonth) return "Please select a day of the month";
    }
  }

  if (schedule.kind === "interval") {
    if (!schedule.every || schedule.every < 1)
      return "Please set a valid interval";
  }

  if (schedule.startDate && schedule.endDate) {
    if (new Date(schedule.startDate) >= new Date(schedule.endDate)) {
      return "Start date must be before end date";
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { schedules: CronSchedule[] }) => void;
  defaultValues?: Partial<z.infer<typeof scheduleSchema>>[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CronTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const initialSchedules = useMemo(() => {
    if (!defaultValues || defaultValues.length === 0) {
      return [
        {
          id: crypto.randomUUID(),
          kind: "preset" as const,
          presetId: "daily",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        },
      ];
    }
    return defaultValues.map((s) => ({
      ...s,
      id: s.id || crypto.randomUUID(),
    }));
  }, [defaultValues]);

  const form = useForm<DialogFormValues>({
    // biome-ignore lint/suspicious/noExplicitAny: zod coerce produces unknown output that conflicts with the form value type
    resolver: zodResolver(dialogSchema) as any,
    defaultValues: { schedules: initialSchedules },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const [activeKind, setActiveKind] = useState<"preset" | "cron" | "interval">(
    (initialSchedules[0]?.kind as "preset" | "cron" | "interval") || "preset",
  );

  useEffect(() => {
    if (open) {
      const sched = initialSchedules[0];
      if (sched) setActiveKind((sched.kind as typeof activeKind) || "preset");
    }
  }, [open, initialSchedules]);

  const updateAllKinds = useCallback(
    (kind: "preset" | "cron" | "interval") => {
      setActiveKind(kind);
      fields.forEach((_field, i) => {
        form.setValue(`schedules.${i}.kind`, kind, { shouldValidate: true });
        if (kind !== "cron")
          form.setValue(`schedules.${i}.cronExpression`, "", {
            shouldValidate: false,
          });
        if (kind !== "preset")
          form.setValue(`schedules.${i}.presetId`, "", {
            shouldValidate: false,
          });
        if (kind !== "interval") {
          form.setValue(`schedules.${i}.every`, undefined, {
            shouldValidate: false,
          });
          form.setValue(`schedules.${i}.unit`, undefined, {
            shouldValidate: false,
          });
        }
      });
    },
    [fields, form],
  );

  const validateAll = useCallback((): string | null => {
    const schedules = form.getValues("schedules");
    for (let i = 0; i < schedules.length; i++) {
      const err = validateSchedule(schedules[i]);
      if (err) return `Schedule ${i + 1}: ${err}`;
    }
    return null;
  }, [form]);

  const handleSubmit = useCallback(
    (values: DialogFormValues) => {
      const error = validateAll();
      if (error) {
        return;
      }
      onSubmit({
        schedules: values.schedules.map((s) => ({
          id: s.id || crypto.randomUUID(),
          kind: s.kind,
          presetId:
            s.kind === "preset"
              ? (s.presetId as CronSchedule["presetId"])
              : undefined,
          minute:
            s.hour !== undefined || s.minute !== undefined
              ? s.minute
              : undefined,
          hour:
            s.hour !== undefined || s.minute !== undefined ? s.hour : undefined,
          dayOfWeek: s.dayOfWeek,
          dayOfMonth: s.dayOfMonth,
          cronExpression: s.kind === "cron" ? s.cronExpression : undefined,
          every: s.kind === "interval" ? s.every : undefined,
          unit: s.kind === "interval" ? s.unit : undefined,
          timezone: s.timezone,
          startDate: s.startDate || undefined,
          endDate: s.endDate || undefined,
        })),
      });
      onOpenChange(false);
    },
    [onSubmit, onOpenChange, validateAll],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            Schedule Configuration
          </DialogTitle>
          <DialogDescription>
            Set one or more schedules to trigger this workflow automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Mode selector */}
            <div className="flex gap-2">
              {(["preset", "cron", "interval"] as const).map((kind) => (
                <Button
                  key={kind}
                  type="button"
                  variant={activeKind === kind ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateAllKinds(kind)}
                >
                  {kind === "preset"
                    ? "Preset"
                    : kind === "cron"
                      ? "Custom Cron"
                      : "Interval"}
                </Button>
              ))}
            </div>

            {/* Schedules list */}
            {fields.map((field, index) => (
              <ScheduleEditor
                key={field.id}
                index={index}
                kind={activeKind}
                form={form}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  kind: activeKind,
                  presetId: "daily",
                  timezone:
                    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                })
              }
            >
              <PlusIcon className="size-4 mr-1" />
              Add another schedule
            </Button>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Schedule editor
// ---------------------------------------------------------------------------

interface ScheduleEditorProps {
  index: number;
  kind: "preset" | "cron" | "interval";
  form: UseFormReturn<DialogFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

function ScheduleEditor({
  index,
  kind,
  form,
  onRemove,
  canRemove,
}: ScheduleEditorProps) {
  const watchAll = form.watch(`schedules.${index}`);

  const preview = useMemo(() => {
    if (kind === "cron") return null;

    const sched: Partial<z.infer<typeof scheduleSchema>> = {
      kind,
      presetId: watchAll?.presetId,
      minute: watchAll?.minute,
      hour: watchAll?.hour,
      dayOfWeek: watchAll?.dayOfWeek,
      dayOfMonth: watchAll?.dayOfMonth,
      every: watchAll?.every,
      unit: watchAll?.unit,
    };

    try {
      const full: CronSchedule = {
        id: "",
        kind: sched.kind as CronSchedule["kind"],
        timezone: "UTC",
        presetId: sched.presetId as CronSchedule["presetId"],
        minute: sched.minute,
        hour: sched.hour,
        dayOfWeek: sched.dayOfWeek,
        dayOfMonth: sched.dayOfMonth,
        every: sched.every,
        unit: sched.unit as CronSchedule["unit"],
      };
      return cronDescription(full);
    } catch {
      return null;
    }
  }, [watchAll, kind]);

  const cronPreview = useMemo(() => {
    if (kind !== "cron") return null;
    const expr = watchAll?.cronExpression;
    if (!expr) return null;
    const valid = isValidCron(expr);
    if (!valid) return null;
    try {
      const sched: CronSchedule = {
        id: "",
        kind: "cron",
        cronExpression: expr,
        timezone: "UTC",
      };
      return cronDescription(sched);
    } catch {
      return null;
    }
  }, [watchAll, kind]);

  return (
    <div className="border rounded-lg p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Schedule {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={onRemove}
          >
            <TrashIcon className="size-3" />
          </Button>
        )}
      </div>

      {kind === "preset" && (
        <PresetEditor index={index} form={form} preview={preview} />
      )}
      {kind === "cron" && (
        <CronEditor index={index} form={form} preview={cronPreview} />
      )}
      {kind === "interval" && <IntervalEditor index={index} form={form} />}

      {/* Timezone + date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`schedules.${index}.timezone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem
                      key={tz.value}
                      value={tz.value}
                      className="text-sm"
                    >
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`schedules.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Start Date (optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription className="text-[10px]">
                Only fire on or after this date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`schedules.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">End Date (optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription className="text-[10px]">
                Stop firing after this date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset editor
// ---------------------------------------------------------------------------

function PresetEditor({
  index,
  form,
  preview,
}: {
  index: number;
  form: UseFormReturn<DialogFormValues>;
  preview: string | null;
}) {
  const watchPreset = form.watch(`schedules.${index}.presetId`);

  return (
    <div className="space-y-3">
      {/* Preset selector */}
      <FormField
        control={form.control}
        name={`schedules.${index}.presetId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Schedule Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRESET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hour + minute for daily/weekly/monthly */}
      {watchPreset && ["daily", "weekly", "monthly"].includes(watchPreset) && (
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`schedules.${index}.hour`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Hour</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem
                        key={i.toString()}
                        value={i.toString()}
                        className="text-sm"
                      >
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`schedules.${index}.minute`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Minute</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => (
                      <SelectItem
                        key={i.toString()}
                        value={i.toString()}
                        className="text-sm"
                      >
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Day of week for weekly */}
      {watchPreset === "weekly" && (
        <FormField
          control={form.control}
          name={`schedules.${index}.dayOfWeek`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Day(s) of week</FormLabel>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = field.value?.includes(day.value) ?? false;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={`flex items-center gap-1 border rounded px-2 py-1 text-xs cursor-pointer ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        const current = field.value || [];
                        const next = selected
                          ? current.filter((d) => d !== day.value)
                          : [...current, day.value];
                        field.onChange(next);
                      }}
                    >
                      <Checkbox
                        checked={selected}
                        className="pointer-events-none"
                      />
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Day of month for monthly */}
      {watchPreset === "monthly" && (
        <FormField
          control={form.control}
          name={`schedules.${index}.dayOfMonth`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Day of month (1–31)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  className="h-8 text-sm w-24"
                  value={field.value?.toString() || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {preview && (
        <p className="text-xs text-muted-foreground italic">{preview}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cron expression editor
// ---------------------------------------------------------------------------

function CronEditor({
  index,
  form,
  preview,
}: {
  index: number;
  form: UseFormReturn<DialogFormValues>;
  preview: string | null;
}) {
  const _watchExpr = form.watch(`schedules.${index}.cronExpression`);

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={`schedules.${index}.cronExpression`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Cron Expression</FormLabel>
            <FormControl>
              <Input
                placeholder="0 * * * *"
                className="h-8 text-sm font-mono"
                value={field.value || ""}
                onChange={field.onChange}
              />
            </FormControl>
            {field.value && isValidCron(field.value) ? (
              <p className="text-xs text-emerald-600">Valid</p>
            ) : field.value ? (
              <p className="text-xs text-destructive">Invalid expression</p>
            ) : (
              <FormDescription className="text-[10px]">
                Format: minute hour day-of-month month day-of-week. {"  "}
                Examples: {"  "}0 * * * * (hourly), 0 9 * * 1-5 (weekdays at
                9am), 0 4 * * * (daily at 4am)
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {preview && (
        <p className="text-xs text-muted-foreground italic">{preview}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interval editor
// ---------------------------------------------------------------------------

function IntervalEditor({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<DialogFormValues>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name={`schedules.${index}.every`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Every</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                className="h-8 text-sm"
                placeholder="1"
                value={field.value?.toString() || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`schedules.${index}.unit`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Unit</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "minute"}
            >
              <FormControl>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="minute" className="text-sm">
                  Minute(s)
                </SelectItem>
                <SelectItem value="hour" className="text-sm">
                  Hour(s)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
