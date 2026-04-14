"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudOff,
  Dumbbell,
  History,
  LoaderCircle,
  LogIn,
  LogOut,
  Moon,
  NotebookPen,
  PencilLine,
  Play,
  Plus,
  Sparkles,
  Sun,
  TimerReset,
  Trash2,
  X
} from "lucide-react";
import {
  addWorkoutExercise,
  deleteWorkoutLog,
  finishWorkout,
  formatDisplayDate,
  formatDuration,
  formatTodayDate,
  formatWeight,
  getActiveWorkout,
  getExerciseHistory,
  getPreviousExerciseReference,
  getWorkoutCompletion,
  logWorkoutSet,
  mergeLiftStores,
  readLiftStore,
  removeWorkoutExercise,
  renameWorkoutExercise,
  replaceLiftStore,
  startWorkout,
  updateExerciseNote,
  upsertTemplate
} from "@/lib/lift-log/store";
import {
  getLiftLogSyncUser,
  isLiftLogSyncAvailable,
  readLiftLogCloudStore,
  sendLiftLogMagicLink,
  signOutLiftLogSync,
  subscribeToLiftLogAuth,
  writeLiftLogCloudStore
} from "@/lib/lift-log/sync";
import type { LiftStore, WorkoutLog, WorkoutTemplate } from "@/lib/lift-log/types";

type DraftSet = {
  weight: string;
  reps: string;
};

type TemplateEditorState = {
  id?: string;
  name: string;
  exercises: string;
};

type AppView = "today" | "templates" | "calendar" | "logs";
type SyncStatus = "local" | "checking" | "syncing" | "synced" | "error";
type WorkoutSheet = "queue" | "exercise" | "notes" | "history" | null;

const WEIGHT_STEPS = [-5, -2.5, 2.5, 5];
const REP_STEPS = [-1, 1];
const THEME_STORAGE_KEY = "lift-log-theme";
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getInitialDraft(store: LiftStore, workout: WorkoutLog, exerciseId: string): DraftSet {
  const exercise = workout.exercises.find((entry) => entry.exerciseId === exerciseId);
  const latestSet = exercise?.sets.at(-1);
  const previousReference = exercise ? getPreviousExerciseReference(store, exercise.exerciseName, workout.id) : null;
  const source = latestSet ?? previousReference?.latestSet ?? null;

  return {
    weight: source ? `${source.weight}` : "",
    reps: source ? `${source.reps}` : "8"
  };
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatWorkoutDateLabel(date: string, today: string) {
  if (date === today) {
    return "Today";
  }

  return formatDisplayDate(date);
}

function getExerciseCountLabel(workout: WorkoutLog) {
  return `${workout.exercises.length} ${workout.exercises.length === 1 ? "exercise" : "exercises"}`;
}

function getLoggedSetCount(workout: WorkoutLog) {
  return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function getDateKey(date: Date) {
  return formatTodayDate(date);
}

function buildCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const start = new Date(year, monthIndex, 1);
  const startWeekDay = start.getDay();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, monthIndex, index - startWeekDay + 1);
    cells.push(date);
  }

  return cells;
}

function isSameMonth(date: Date, month: Date) {
  return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
}

function ViewButton({
  active,
  children,
  icon,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition"
      style={{
        borderColor: active ? "transparent" : "var(--app-border)",
        background: active ? "var(--app-accent)" : "var(--app-panel-muted)",
        color: active ? "#ffffff" : "var(--app-text-soft)",
        boxShadow: active ? "0 12px 30px var(--app-accent-glow)" : "none"
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function LiftLogApp() {
  const [store, setStore] = useState<LiftStore>({ version: 6, updatedAt: new Date(0).toISOString(), exerciseLibrary: [], templates: [], logs: [] });
  const [drafts, setDrafts] = useState<Record<string, DraftSet>>({});
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [templateEditor, setTemplateEditor] = useState<TemplateEditorState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [view, setView] = useState<AppView>("today");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => formatTodayDate(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [justLoggedExerciseId, setJustLoggedExerciseId] = useState("");
  const [exerciseNameDrafts, setExerciseNameDrafts] = useState<Record<string, string>>({});
  const [newExerciseName, setNewExerciseName] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [syncEmail, setSyncEmail] = useState("");
  const [syncUserEmail, setSyncUserEmail] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncUserId, setSyncUserId] = useState("");
  const [workoutSheet, setWorkoutSheet] = useState<WorkoutSheet>(null);
  const syncAvailable = isLiftLogSyncAvailable();
  const storeRef = useRef(store);
  const lastSyncedStoreRef = useRef("");
  const didRunInitialSyncRef = useRef(false);
  const pushTimerRef = useRef<number | null>(null);

  const today = formatTodayDate(now);
  const activeWorkout = getActiveWorkout(store, today);
  const selectedExercise =
    activeWorkout?.exercises.find((exercise) => exercise.exerciseId === selectedExerciseId) ?? activeWorkout?.exercises[0] ?? null;
  const selectedExerciseIndex =
    activeWorkout && selectedExercise
      ? activeWorkout.exercises.findIndex((exercise) => exercise.exerciseId === selectedExercise.exerciseId)
      : -1;
  const selectedHistory = selectedExercise ? getExerciseHistory(store, selectedExercise.exerciseName) : [];
  const selectedPreviousReference = selectedExercise ? getPreviousExerciseReference(store, selectedExercise.exerciseName, activeWorkout?.id) : null;
  const workoutCompletion = activeWorkout ? getWorkoutCompletion(activeWorkout) : null;
  const recentLogs = useMemo(() => [...store.logs].sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [store.logs]);
  const logsByDate = useMemo(() => {
    return recentLogs.reduce<Record<string, WorkoutLog[]>>((accumulator, log) => {
      accumulator[log.date] = [...(accumulator[log.date] ?? []), log];
      return accumulator;
    }, {});
  }, [recentLogs]);
  const selectedDateLogs = logsByDate[selectedCalendarDate] ?? [];
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const storeSignature = useMemo(() => JSON.stringify(store), [store]);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    const nextStore = readLiftStore();
    setStore(nextStore);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!syncAvailable) {
      setSyncStatus("local");
      return;
    }

    let active = true;
    setSyncStatus("checking");

    getLiftLogSyncUser()
      .then((user) => {
        if (!active) {
          return;
        }

        setSyncUserId(user?.id ?? "");
        setSyncUserEmail(user?.email ?? "");
        setSyncEmail((current) => current || user?.email || "");
        setSyncStatus(user ? "syncing" : "local");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setSyncStatus("error");
        setSyncMessage(error instanceof Error ? error.message : "Could not connect cloud sync.");
      });

    const unsubscribe = subscribeToLiftLogAuth((user) => {
      setSyncUserId(user?.id ?? "");
      setSyncUserEmail(user?.email ?? "");
      setSyncEmail((current) => current || user?.email || "");
      setSyncStatus(user ? "syncing" : "local");
      setSyncMessage(user ? "Cloud sync connected." : "");
      didRunInitialSyncRef.current = false;
    });

    return () => {
      active = false;
      unsubscribe();
      if (pushTimerRef.current) {
        window.clearTimeout(pushTimerRef.current);
      }
    };
  }, [syncAvailable]);

  useEffect(() => {
    if (!syncAvailable || !hasHydrated || !syncUserId || didRunInitialSyncRef.current) {
      return;
    }

    let cancelled = false;

    async function bootstrapSync() {
      try {
        setSyncStatus("syncing");
        const remoteStore = await readLiftLogCloudStore(syncUserId);
        const mergedStore = remoteStore ? mergeLiftStores(storeRef.current, remoteStore) : replaceLiftStore(storeRef.current);
        const mergedSignature = JSON.stringify(mergedStore);

        if (cancelled) {
          return;
        }

        didRunInitialSyncRef.current = true;
        lastSyncedStoreRef.current = mergedSignature;

        if (mergedSignature !== JSON.stringify(storeRef.current)) {
          setStore(mergedStore);
        }

        await writeLiftLogCloudStore(syncUserId, mergedStore);

        if (cancelled) {
          return;
        }

        lastSyncedStoreRef.current = mergedSignature;
        setSyncStatus("synced");
        setSyncMessage(remoteStore ? "Cloud sync is live across your devices." : "First cloud backup saved.");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSyncStatus("error");
        setSyncMessage(error instanceof Error ? error.message : "Cloud sync hit a snag.");
      }
    }

    bootstrapSync();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, syncAvailable, syncUserId]);

  useEffect(() => {
    if (!syncAvailable || !hasHydrated || !syncUserId || !didRunInitialSyncRef.current) {
      return;
    }

    if (storeSignature === lastSyncedStoreRef.current) {
      return;
    }

    if (pushTimerRef.current) {
      window.clearTimeout(pushTimerRef.current);
    }

    setSyncStatus("syncing");
    pushTimerRef.current = window.setTimeout(async () => {
      try {
        await writeLiftLogCloudStore(syncUserId, storeRef.current);
        lastSyncedStoreRef.current = JSON.stringify(storeRef.current);
        setSyncStatus("synced");
      } catch (error) {
        setSyncStatus("error");
        setSyncMessage(error instanceof Error ? error.message : "Cloud sync hit a snag.");
      }
    }, 700);

    return () => {
      if (pushTimerRef.current) {
        window.clearTimeout(pushTimerRef.current);
      }
    };
  }, [hasHydrated, storeSignature, syncAvailable, syncUserId]);

  useEffect(() => {
    const preferredTheme =
      window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ||
      (!window.localStorage.getItem(THEME_STORAGE_KEY) && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";

    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeWorkout) {
      setDrafts({});
      setSelectedExerciseId("");
      setExerciseNameDrafts({});
      setWorkoutSheet(null);
      return;
    }

    setSelectedExerciseId((current) => {
      if (current && activeWorkout.exercises.some((exercise) => exercise.exerciseId === current)) {
        return current;
      }

      return activeWorkout.exercises[0]?.exerciseId ?? "";
    });

    setDrafts((current) => {
      const next: Record<string, DraftSet> = {};

      for (const exercise of activeWorkout.exercises) {
        next[exercise.exerciseId] = current[exercise.exerciseId] ?? getInitialDraft(store, activeWorkout, exercise.exerciseId);
      }

      return next;
    });

    setExerciseNameDrafts((current) => {
      const next: Record<string, string> = {};

      for (const exercise of activeWorkout.exercises) {
        next[exercise.exerciseId] = current[exercise.exerciseId] ?? exercise.exerciseName;
      }

      return next;
    });
  }, [activeWorkout, store]);

  function adjustDraft(exerciseId: string, field: "weight" | "reps", delta: number) {
    setDrafts((current) => {
      const activeDraft = current[exerciseId] ?? { weight: "", reps: "8" };
      const currentValue = Number(activeDraft[field] || 0);
      const nextValue = Math.max(field === "weight" ? 0 : 1, currentValue + delta);

      return {
        ...current,
        [exerciseId]: {
          ...activeDraft,
          [field]: nextValue === 0 ? "" : `${Number.isInteger(nextValue) ? nextValue : nextValue.toFixed(1)}`
        }
      };
    });
  }

  function updateDraft(exerciseId: string, field: "weight" | "reps", value: string) {
    setDrafts((current) => ({
      ...current,
      [exerciseId]: {
        ...(current[exerciseId] ?? { weight: "", reps: "8" }),
        [field]: value
      }
    }));
  }

  function handleStartWorkout(templateId: string) {
    setStore((current) => startWorkout(current, templateId).store);
    setView("today");
  }

  function handleSaveTemplate() {
    if (!templateEditor) {
      return;
    }

    const exerciseLines = templateEditor.exercises
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    setStore((current) =>
      upsertTemplate(current, {
        id: templateEditor.id,
        name: templateEditor.name,
        exercises: exerciseLines
      })
    );
    setTemplateEditor(null);
  }

  function handleLogSet(workoutId: string, exerciseId: string) {
    const draft = drafts[exerciseId];
    const weight = parsePositiveNumber(draft?.weight ?? "");
    const reps = parsePositiveNumber(draft?.reps ?? "");

    if (!weight || !reps) {
      return;
    }

    setStore((current) => logWorkoutSet(current, workoutId, exerciseId, { weight, reps }));
    setDrafts((current) => ({
      ...current,
      [exerciseId]: {
        weight: `${weight}`,
        reps: `${reps}`
      }
    }));
    setJustLoggedExerciseId(exerciseId);
    window.setTimeout(() => {
      setJustLoggedExerciseId((current) => (current === exerciseId ? "" : current));
    }, 950);
  }

  function openTemplateEditor(template?: WorkoutTemplate) {
    setTemplateEditor({
      id: template?.id,
      name: template?.name ?? "",
      exercises: template?.exercises.map((exercise) => exercise.name).join("\n") ?? ""
    });
  }

  function handleDeleteLog(workoutId: string) {
    setStore((current) => deleteWorkoutLog(current, workoutId));
  }

  function handleRenameExercise(workoutId: string, exerciseId: string) {
    const nextName = exerciseNameDrafts[exerciseId]?.trim();

    if (!nextName) {
      return;
    }

    setStore((current) => renameWorkoutExercise(current, workoutId, exerciseId, nextName));
  }

  function handleAddExercise(workoutId: string) {
    const nextName = newExerciseName.trim();

    if (!nextName) {
      return;
    }

    setStore((current) => {
      const result = addWorkoutExercise(current, workoutId, nextName);
      if (result.exerciseId) {
        setSelectedExerciseId(result.exerciseId);
      }
      return result.store;
    });
    setNewExerciseName("");
  }

  async function handleSendMagicLink() {
    const email = syncEmail.trim();

    if (!email) {
      return;
    }

    try {
      setSyncBusy(true);
      setSyncMessage("");
      await sendLiftLogMagicLink(email);
      setSyncMessage("Magic link sent. Open it on this device to connect sync.");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "Could not send magic link.");
    } finally {
      setSyncBusy(false);
    }
  }

  async function handleSignOutSync() {
    try {
      setSyncBusy(true);
      await signOutLiftLogSync();
      setSyncStatus("local");
      setSyncMessage("Cloud sync disconnected on this device.");
    } finally {
      setSyncBusy(false);
    }
  }

  function handleRemoveExercise(workoutId: string, exerciseId: string) {
    const workout = store.logs.find((log) => log.id === workoutId);

    if (!workout || workout.exercises.length <= 1) {
      return;
    }

    const exerciseIndex = workout.exercises.findIndex((exercise) => exercise.exerciseId === exerciseId);
    const fallbackExerciseId = workout.exercises[exerciseIndex + 1]?.exerciseId ?? workout.exercises[exerciseIndex - 1]?.exerciseId ?? "";

    setStore((current) => removeWorkoutExercise(current, workoutId, exerciseId));
    setSelectedExerciseId(fallbackExerciseId);
  }

  function goToExercise(offset: number) {
    if (!activeWorkout || selectedExerciseIndex < 0) {
      return;
    }

    const target = activeWorkout.exercises[selectedExerciseIndex + offset];

    if (target) {
      setSelectedExerciseId(target.exerciseId);
    }
  }

  function openCalendar(date: string = today) {
    const parsed = new Date(`${date}T12:00:00`);
    setSelectedCalendarDate(date);
    setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setView("calendar");
  }

  function renderTemplatesSection() {
    return (
      <section
        className="rounded-[30px] border p-4 backdrop-blur sm:p-5"
        style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
              Templates
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Pick a session and go.</h2>
          </div>
          <button
            type="button"
            onClick={() => openTemplateEditor()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold text-white transition"
            style={{ borderColor: "transparent", background: "var(--app-accent)", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {store.templates.map((template) => (
            <article
              key={template.id}
              className="rounded-[26px] border p-4"
              style={{
                borderColor: "var(--app-border)",
                background: "var(--app-panel-muted)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                    style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                  >
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.05em]">{template.name}</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--app-text-soft)" }}>
                    {template.exercises.length} exercises
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openTemplateEditor(template)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition"
                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
                  aria-label={`Edit ${template.name}`}
                >
                  <PencilLine className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {template.exercises.map((exercise) => (
                  <span
                    key={exercise.id}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={{
                      borderColor: "var(--app-border)",
                      background: "var(--app-panel-solid)",
                      color: "var(--app-text-soft)"
                    }}
                  >
                    {exercise.name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleStartWorkout(template.id)}
                disabled={Boolean(activeWorkout)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
                style={{ background: activeWorkout ? "var(--app-text-muted)" : "var(--app-panel-strong)" }}
              >
                <Play className="h-4 w-4" />
                {activeWorkout ? "Finish current workout first" : "Start workout"}
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderLogCard(log: WorkoutLog) {
    const setCount = getLoggedSetCount(log);
    const noteCount = log.exercises.filter((exercise) => exercise.note.trim()).length;

    return (
      <article
        key={log.id}
        className="rounded-[26px] border p-4"
        style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-muted)" }}
            >
              {log.completedAt ? <Check className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {log.completedAt ? "Completed" : "Active"}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.05em]">{log.templateName}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--app-text-soft)" }}>
              {formatWorkoutDateLabel(log.date, today)} · {getExerciseCountLabel(log)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDeleteLog(log.id)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition"
            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
            aria-label={`Delete ${log.templateName} log`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm" style={{ color: "var(--app-text-soft)" }}>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}>
            {setCount} logged sets
          </span>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}>
            {noteCount} notes
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {log.exercises.map((exercise) => (
            <div key={exercise.exerciseId} className="rounded-[18px] px-3 py-3" style={{ background: "var(--app-panel-solid)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{exercise.exerciseName}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--app-text-soft)" }}>
                    {exercise.sets.length > 0
                      ? `Latest ${formatWeight(exercise.sets.at(-1)?.weight ?? 0)} x ${exercise.sets.at(-1)?.reps ?? 0}`
                      : "No sets logged"}
                  </p>
                </div>
                {exercise.note ? <NotebookPen className="mt-0.5 h-4 w-4" style={{ color: "var(--app-accent)" }} /> : null}
              </div>
              {exercise.note ? (
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                  {exercise.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </article>
    );
  }

  function renderLogsSection(logs: WorkoutLog[], title: string, description: string) {
    return (
      <section
        className="rounded-[30px] border p-4 backdrop-blur sm:p-5"
        style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                Logs
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{title}</h2>
          </div>
          <p className="max-w-md text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
            {description}
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {logs.length > 0 ? (
            logs.map((log) => renderLogCard(log))
          ) : (
            <div
              className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-6"
              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
            >
              No workouts logged here yet.
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderCalendarSection() {
    return (
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section
          className="rounded-[30px] border p-4 backdrop-blur sm:p-5"
          style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                Calendar
              </p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] sm:text-2xl">{getMonthLabel(calendarMonth)}</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 hidden grid-cols-7 gap-2 sm:grid">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="rounded-full px-2 py-2 text-center text-[0.76rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--app-text-muted)" }}
              >
                {day}
              </div>
            ))}

            {calendarDays.map((date) => {
              const dateKey = getDateKey(date);
              const logCount = logsByDate[dateKey]?.length ?? 0;
              const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
              const isSelected = selectedCalendarDate === dateKey;
              const isToday = dateKey === today;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedCalendarDate(dateKey)}
                  className="min-h-[72px] rounded-[20px] border px-2 py-3 text-left transition"
                  style={{
                    borderColor: isSelected ? "var(--app-accent)" : "var(--app-border)",
                    background: isSelected ? "var(--app-accent-soft)" : "var(--app-panel-muted)",
                    color: isCurrentMonth ? "var(--app-text)" : "var(--app-text-muted)",
                    boxShadow: isSelected ? "0 12px 30px var(--app-accent-glow)" : "none",
                    opacity: isCurrentMonth ? 1 : 0.55
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{date.getDate()}</span>
                    {isToday ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                        style={{ background: "var(--app-accent)", color: "#ffffff" }}
                      >
                        Today
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {logCount > 0 ? (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--app-accent)" }} />
                        <span className="text-[0.8rem] font-medium" style={{ color: "var(--app-text-soft)" }}>
                          {logCount} {logCount === 1 ? "log" : "logs"}
                        </span>
                      </>
                    ) : (
                      <span className="text-[0.8rem]" style={{ color: "var(--app-text-muted)" }}>
                        No logs
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:hidden">
            {calendarDays
              .filter((date) => isSameMonth(date, calendarMonth))
              .map((date) => {
                const dateKey = getDateKey(date);
                const logCount = logsByDate[dateKey]?.length ?? 0;
                const isSelected = selectedCalendarDate === dateKey;
                const isToday = dateKey === today;
                const weekday = WEEK_DAYS[date.getDay()];

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedCalendarDate(dateKey)}
                    className="min-h-[108px] rounded-[22px] border px-3 py-3 text-left transition"
                    style={{
                      borderColor: isSelected ? "var(--app-accent)" : "var(--app-border)",
                      background: isSelected ? "var(--app-accent-soft)" : "var(--app-panel-muted)",
                      boxShadow: isSelected ? "0 12px 30px var(--app-accent-glow)" : "none"
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--app-text-muted)" }}>
                          {weekday}
                        </p>
                        <p className="mt-1 text-[1.35rem] font-semibold">{date.getDate()}</p>
                      </div>
                      {isToday ? (
                        <span
                          className="rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                          style={{ background: "var(--app-accent)", color: "#ffffff" }}
                        >
                          Today
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      {logCount > 0 ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--app-accent)" }} />
                          <span className="text-[0.95rem] font-medium" style={{ color: "var(--app-text-soft)" }}>
                            {logCount} {logCount === 1 ? "log" : "logs"}
                          </span>
                        </>
                      ) : (
                        <span className="text-[0.95rem]" style={{ color: "var(--app-text-muted)" }}>
                          No logs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        <section
          className="rounded-[30px] border p-4 backdrop-blur sm:p-5"
          style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
              Selected Day
            </p>
          </div>
          <h2 className="mt-2 text-[1.95rem] font-semibold tracking-[-0.05em] sm:text-2xl">{formatWorkoutDateLabel(selectedCalendarDate, today)}</h2>
          <p className="mt-2 text-[0.98rem] leading-7 sm:text-sm sm:leading-6" style={{ color: "var(--app-text-soft)" }}>
            Tap any workout day to jump through your training week-by-week without scrolling through the full app.
          </p>

          <div className="mt-5 space-y-3">
            {selectedDateLogs.length > 0 ? (
              selectedDateLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setView("logs")}
                  className="w-full rounded-[22px] border p-4 text-left"
                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[1.02rem] font-semibold sm:text-base">{log.templateName}</p>
                      <p className="mt-1 text-[0.98rem] sm:text-sm" style={{ color: "var(--app-text-soft)" }}>
                        {getLoggedSetCount(log)} sets · {getExerciseCountLabel(log)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4" style={{ color: "var(--app-text-muted)" }} />
                  </div>
                </button>
              ))
            ) : (
              <div
                className="rounded-[24px] border border-dashed px-4 py-5 text-[0.98rem] leading-7 sm:text-sm sm:leading-6"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
              >
                No workouts logged on this day yet.
              </div>
            )}
          </div>
        </section>
      </section>
    );
  }

  function renderTodayView() {
    if (activeWorkout) {
      return (
        <>
          <section className="space-y-4 xl:hidden">
            <section
              className="rounded-[30px] border px-4 py-4"
              style={{
                borderColor: "var(--app-border)",
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--app-panel-strong) 92%, var(--app-accent) 8%), var(--app-panel-strong))",
                boxShadow: "var(--app-shadow)",
                color: "var(--app-on-strong)"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    {activeWorkout.templateName}
                  </p>
                  <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.06em]">
                    {selectedExercise?.exerciseName ?? activeWorkout.templateName}
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                    Exercise {selectedExerciseIndex + 1} of {activeWorkout.exercises.length} · {formatDuration(activeWorkout.startedAt, now)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStore((current) => finishWorkout(current, activeWorkout.id))}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold"
                  style={{ background: "var(--app-accent)", color: "#ffffff", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                >
                  Finish
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {activeWorkout.exercises.map((exercise, index) => {
                  const isCurrent = exercise.exerciseId === selectedExercise?.exerciseId;

                  return (
                    <button
                      key={exercise.exerciseId}
                      type="button"
                      onClick={() => setSelectedExerciseId(exercise.exerciseId)}
                      className="min-w-[136px] shrink-0 rounded-[22px] border px-3 py-3 text-left transition"
                      style={{
                        borderColor: isCurrent ? "var(--app-accent)" : "var(--app-border)",
                        background: isCurrent ? "var(--app-accent-soft)" : "rgba(255,255,255,0.06)",
                        boxShadow: isCurrent ? "0 12px 30px var(--app-accent-glow)" : "none"
                      }}
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]" style={{ color: isCurrent ? "var(--app-accent)" : "var(--app-text-muted)" }}>
                        {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-5">{exercise.exerciseName}</p>
                      <p className="mt-2 text-xs" style={{ color: "var(--app-text-soft)" }}>
                        {exercise.sets.length > 0 ? `${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"} logged` : "Up next"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedExercise ? (
              <>
                <section
                  className="rounded-[30px] border p-4"
                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                        Focus
                      </p>
                      <h3 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.05em]">{selectedExercise.exerciseName}</h3>
                    </div>
                    {justLoggedExerciseId === selectedExercise.exerciseId ? (
                      <span
                        className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold"
                        style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                      >
                        <Check className="h-4 w-4" />
                        Logged
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--app-text-muted)" }}>
                            Last reference
                          </p>
                          <p className="mt-2 text-base font-semibold">
                            {selectedPreviousReference
                              ? `${formatWeight(selectedPreviousReference.latestSet.weight)} x ${selectedPreviousReference.latestSet.reps}`
                              : "No prior log"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openCalendar(activeWorkout.date)}
                          className="rounded-full border px-3 py-2 text-sm"
                          style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
                        >
                          {formatDisplayDate(activeWorkout.date)}
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                        {selectedPreviousReference?.note || "No saved note yet for this lift."}
                      </p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedExercise.sets.length > 0 ? (
                        selectedExercise.sets.map((set, setIndex) => (
                          <button
                            key={set.id}
                            type="button"
                            onClick={() =>
                              setDrafts((current) => ({
                                ...current,
                                [selectedExercise.exerciseId]: {
                                  weight: `${set.weight}`,
                                  reps: `${set.reps}`
                                }
                              }))
                            }
                            className="shrink-0 rounded-full border px-3 py-2 text-sm font-medium"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                          >
                            Set {setIndex + 1} · {formatWeight(set.weight)} x {set.reps}
                          </button>
                        ))
                      ) : (
                        <div
                          className="rounded-full border border-dashed px-3 py-2 text-sm"
                          style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)" }}
                        >
                          First set will stay loaded for quick repeats.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWorkoutSheet("queue")}
                    className="rounded-[22px] border px-4 py-4 text-left"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel)" }}
                  >
                    <p className="text-sm font-semibold">Queue</p>
                    <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                      Jump to any lift.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutSheet("exercise")}
                    className="rounded-[22px] border px-4 py-4 text-left"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel)" }}
                  >
                    <p className="text-sm font-semibold">Change</p>
                    <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                      Swap, add, or remove.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutSheet("notes")}
                    className="rounded-[22px] border px-4 py-4 text-left"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel)" }}
                  >
                    <p className="text-sm font-semibold">Notes</p>
                    <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                      Keep next-time cues.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkoutSheet("history")}
                    className="rounded-[22px] border px-4 py-4 text-left"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel)" }}
                  >
                    <p className="text-sm font-semibold">History</p>
                    <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                      Quick progression view.
                    </p>
                  </button>
                </section>
              </>
            ) : null}

            {selectedExercise && workoutSheet ? (
              <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm" onClick={() => setWorkoutSheet(null)}>
                <div className="flex min-h-full items-end justify-center p-4">
                  <section
                    className="w-full max-w-xl rounded-[30px] border p-4"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", boxShadow: "0 30px 120px rgba(15,15,15,0.28)" }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                          {workoutSheet === "queue" ? "Workout queue" : workoutSheet === "exercise" ? "Exercise setup" : workoutSheet === "notes" ? "Notes" : "History"}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                          {workoutSheet === "queue"
                            ? "Jump through the workout."
                            : workoutSheet === "exercise"
                              ? "Change the current lift."
                              : workoutSheet === "notes"
                                ? selectedExercise.exerciseName
                                : `${selectedExercise.exerciseName} progression`}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWorkoutSheet(null)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                        style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {workoutSheet === "queue" ? (
                      <div className="mt-4 space-y-3">
                        {activeWorkout.exercises.map((exercise, index) => {
                          const isCurrent = exercise.exerciseId === selectedExercise.exerciseId;

                          return (
                            <button
                              key={exercise.exerciseId}
                              type="button"
                              onClick={() => {
                                setSelectedExerciseId(exercise.exerciseId);
                                setWorkoutSheet(null);
                              }}
                              className="w-full rounded-[22px] border p-4 text-left"
                              style={{
                                borderColor: isCurrent ? "var(--app-accent)" : "var(--app-border)",
                                background: isCurrent ? "var(--app-accent-soft)" : "var(--app-panel-muted)"
                              }}
                            >
                              <p className="text-sm font-semibold">
                                {index + 1}. {exercise.exerciseName}
                              </p>
                              <p className="mt-1 text-sm" style={{ color: "var(--app-text-soft)" }}>
                                {exercise.sets.length > 0 ? `${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"} logged` : "No sets yet"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {workoutSheet === "exercise" ? (
                      <div className="mt-4 space-y-4">
                        <label className="block rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                            Swap exercise
                          </span>
                          <input
                            list="lift-log-exercise-library"
                            value={exerciseNameDrafts[selectedExercise.exerciseId] ?? selectedExercise.exerciseName}
                            onChange={(event) =>
                              setExerciseNameDrafts((current) => ({
                                ...current,
                                [selectedExercise.exerciseId]: event.target.value
                              }))
                            }
                            className="mt-3 h-14 w-full rounded-[18px] border px-4 text-base font-semibold outline-none"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                            placeholder="Choose or type an exercise"
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              handleRenameExercise(activeWorkout.id, selectedExercise.exerciseId);
                              setWorkoutSheet(null);
                            }}
                            className="min-h-12 rounded-[18px] border px-4 text-sm font-semibold"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                          >
                            Update exercise
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleRemoveExercise(activeWorkout.id, selectedExercise.exerciseId);
                              setWorkoutSheet(null);
                            }}
                            disabled={activeWorkout.exercises.length <= 1}
                            className="min-h-12 rounded-[18px] border px-4 text-sm font-semibold"
                            style={{
                              borderColor: activeWorkout.exercises.length <= 1 ? "var(--app-border)" : "rgba(190,50,50,0.22)",
                              background: activeWorkout.exercises.length <= 1 ? "var(--app-panel-muted)" : "rgba(190,50,50,0.08)",
                              color: activeWorkout.exercises.length <= 1 ? "var(--app-text-muted)" : "#c45151"
                            }}
                          >
                            {activeWorkout.exercises.length <= 1 ? "Keep one exercise" : "Remove exercise"}
                          </button>
                        </div>
                        <label className="block rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                            Add exercise to queue
                          </span>
                          <input
                            list="lift-log-exercise-library"
                            value={newExerciseName}
                            onChange={(event) => setNewExerciseName(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddExercise(activeWorkout.id);
                                setWorkoutSheet(null);
                              }
                            }}
                            className="mt-3 h-14 w-full rounded-[18px] border px-4 text-base font-medium outline-none"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                            placeholder="Search the library or type a new exercise"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddExercise(activeWorkout.id);
                            setWorkoutSheet(null);
                          }}
                          className="min-h-12 w-full rounded-[18px] px-4 text-sm font-semibold text-white"
                          style={{ background: "var(--app-accent)", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                        >
                          Add exercise
                        </button>
                      </div>
                    ) : null}

                    {workoutSheet === "notes" ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                            Last note
                          </p>
                          <p className="mt-3 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                            {selectedPreviousReference?.note || "No saved note yet for this lift."}
                          </p>
                        </div>
                        <label className="block rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                            Note for next time
                          </span>
                          <textarea
                            value={selectedExercise.note}
                            onChange={(event) =>
                              setStore((current) => updateExerciseNote(current, activeWorkout.id, selectedExercise.exerciseId, event.target.value))
                            }
                            className="mt-3 min-h-32 w-full resize-none rounded-[18px] border px-4 py-3 text-sm leading-6 outline-none"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                            placeholder="Grip felt better slightly wider. Rest 90 seconds. Left shoulder needed more warmup."
                          />
                        </label>
                      </div>
                    ) : null}

                    {workoutSheet === "history" ? (
                      <div className="mt-4 space-y-3">
                        {selectedHistory.length > 0 ? (
                          selectedHistory.map((item) => (
                            <article
                              key={item.workoutId}
                              className="rounded-[22px] border p-4"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{formatWorkoutDateLabel(item.date, today)}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: "var(--app-text-muted)" }}>
                                    {item.templateName}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: "var(--app-text-soft)" }}>
                                  {item.latestSet ? `${formatWeight(item.latestSet.weight)} x ${item.latestSet.reps}` : "—"}
                                </span>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div
                            className="rounded-[22px] border border-dashed px-4 py-5 text-sm leading-6"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                          >
                            History appears here automatically once you log this lift.
                          </div>
                        )}
                      </div>
                    ) : null}
                  </section>
                </div>
              </div>
            ) : null}

            {selectedExercise ? (
              <div
                className="fixed inset-x-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                style={{ bottom: 0 }}
              >
                <div
                  className="rounded-[30px] border p-3 shadow-[0_24px_70px_rgba(15,15,15,0.25)] backdrop-blur"
                  style={{ borderColor: "var(--app-border)", background: "color-mix(in srgb, var(--app-panel) 92%, transparent)" }}
                >
                  <div className="flex items-center justify-between gap-2 px-1 pb-3">
                    <button
                      type="button"
                      onClick={() => goToExercise(-1)}
                      disabled={selectedExerciseIndex <= 0}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium disabled:opacity-40"
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkoutSheet("queue")}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium"
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                    >
                      Queue
                    </button>
                    <button
                      type="button"
                      onClick={() => goToExercise(1)}
                      disabled={selectedExerciseIndex >= activeWorkout.exercises.length - 1}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium disabled:opacity-40"
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      inputMode="decimal"
                      value={drafts[selectedExercise.exerciseId]?.weight ?? ""}
                      onChange={(event) => updateDraft(selectedExercise.exerciseId, "weight", event.target.value)}
                      className="h-14 rounded-[18px] border px-4 text-2xl font-semibold tracking-[-0.05em] outline-none"
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                      placeholder="0"
                    />
                    <input
                      inputMode="numeric"
                      value={drafts[selectedExercise.exerciseId]?.reps ?? ""}
                      onChange={(event) => updateDraft(selectedExercise.exerciseId, "reps", event.target.value)}
                      className="h-14 rounded-[18px] border px-4 text-2xl font-semibold tracking-[-0.05em] outline-none"
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                      placeholder="8"
                    />
                    <button
                      type="button"
                      onClick={() => handleLogSet(activeWorkout.id, selectedExercise.exerciseId)}
                      disabled={
                        !parsePositiveNumber(drafts[selectedExercise.exerciseId]?.weight ?? "") ||
                        !parsePositiveNumber(drafts[selectedExercise.exerciseId]?.reps ?? "")
                      }
                      className="min-h-14 rounded-[18px] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed"
                      style={{
                        background:
                          !parsePositiveNumber(drafts[selectedExercise.exerciseId]?.weight ?? "") ||
                          !parsePositiveNumber(drafts[selectedExercise.exerciseId]?.reps ?? "")
                            ? "var(--app-text-muted)"
                            : justLoggedExerciseId === selectedExercise.exerciseId
                              ? "linear-gradient(160deg, #20b15a, #169149)"
                              : "linear-gradient(160deg, var(--app-accent), var(--app-accent-strong))",
                        boxShadow:
                          justLoggedExerciseId === selectedExercise.exerciseId
                            ? "0 16px 38px rgba(22,145,73,0.28)"
                            : "0 16px 36px var(--app-accent-glow)"
                      }}
                    >
                      {justLoggedExerciseId === selectedExercise.exerciseId ? "Logged" : "Log set"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="hidden xl:grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-4">
            <section
              className="rounded-[30px] border px-5 py-5 sm:px-6"
              style={{
                borderColor: "var(--app-border)",
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--app-panel-strong) 92%, var(--app-accent) 8%), var(--app-panel-strong))",
                boxShadow: "var(--app-shadow)",
                color: "var(--app-on-strong)"
              }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Active Workout
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{activeWorkout.templateName}</h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm" style={{ color: "var(--app-text-soft)" }}>
                    <button
                      type="button"
                      onClick={() => openCalendar(activeWorkout.date)}
                      className="rounded-full border px-3 py-1.5"
                      style={{ borderColor: "var(--app-border)" }}
                    >
                      {formatDisplayDate(activeWorkout.date)}
                    </button>
                    <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>
                      <TimerReset className="mr-2 inline h-4 w-4 align-[-2px]" />
                      {formatDuration(activeWorkout.startedAt, now)}
                    </span>
                    <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>
                      {workoutCompletion?.completedExercises}/{workoutCompletion?.totalExercises} exercises touched
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStore((current) => finishWorkout(current, activeWorkout.id))}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition"
                  style={{ background: "var(--app-accent)", color: "#ffffff", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                >
                  <Check className="h-4 w-4" />
                  Finish workout
                </button>
              </div>
            </section>

            <div className="grid gap-4">
              {activeWorkout.exercises.map((exercise, index) => {
                const draft = drafts[exercise.exerciseId] ?? { weight: "", reps: "8" };
                const previousReference = getPreviousExerciseReference(store, exercise.exerciseName, activeWorkout.id);
                const isExpanded = selectedExerciseId === exercise.exerciseId;
                const isJustLogged = justLoggedExerciseId === exercise.exerciseId;
                const exerciseNameDraft = exerciseNameDrafts[exercise.exerciseId] ?? exercise.exerciseName;

                return (
                  <article
                    key={exercise.exerciseId}
                    className="rounded-[30px] border p-4 transition sm:p-5"
                    style={{
                      borderColor: isJustLogged
                        ? "var(--app-accent)"
                        : isExpanded
                          ? "var(--app-accent)"
                          : "var(--app-border)",
                      background: isExpanded ? "var(--app-panel-solid)" : "var(--app-panel)",
                      boxShadow:
                        isJustLogged
                          ? "0 18px 44px var(--app-accent-glow)"
                          : isExpanded
                          ? "0 18px 40px var(--app-accent-glow)"
                          : "0 24px 70px rgba(20,20,16,0.05)"
                    }}
                    onClick={() => setSelectedExerciseId(exercise.exerciseId)}
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
                          style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          Exercise {index + 1}
                        </div>
                        <h3 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.06em]">{exercise.exerciseName}</h3>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm" style={{ color: "var(--app-text-soft)" }}>
                          {previousReference ? (
                            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                              Last: {formatWeight(previousReference.latestSet.weight)} x {previousReference.latestSet.reps} on{" "}
                              {formatDisplayDate(previousReference.date)}
                            </span>
                          ) : (
                            <span className="rounded-full border border-dashed px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>
                              First time logging this here
                            </span>
                          )}
                          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} logged
                          </span>
                          {previousReference?.note ? (
                            <span
                              className="rounded-full border px-3 py-1.5"
                              style={{ borderColor: "var(--app-accent-glow)", background: "var(--app-note-soft)", color: "var(--app-accent)" }}
                            >
                              Last note saved
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex gap-2 self-start">
                        {isJustLogged ? (
                          <span
                            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
                            style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                          >
                            <Check className="h-4 w-4" />
                            Logged
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedExerciseId((current) => (current === exercise.exerciseId ? "" : exercise.exerciseId));
                          }}
                          className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border px-4 text-sm font-medium transition"
                          style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)", background: "var(--app-panel-solid)" }}
                        >
                          {isExpanded ? "Collapse" : "Open"}
                          <ChevronRight
                            className="h-4 w-4 transition"
                            style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                          />
                        </button>
                      </div>
                    </div>

                    {!isExpanded ? (
                      <div className="mt-4 rounded-[24px] border px-4 py-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                        <div className="flex flex-wrap items-center gap-2 text-[0.95rem]" style={{ color: "var(--app-text-soft)" }}>
                          <span>
                            Ready with {draft.weight || "—"} lb × {draft.reps || "—"}
                          </span>
                          <span className="h-1 w-1 rounded-full" style={{ background: "var(--app-text-muted)" }} />
                          <span>{exercise.note ? "Has note" : "No note yet"}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                          <label className="rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                              Exercise
                            </span>
                            <input
                              list="lift-log-exercise-library"
                              value={exerciseNameDraft}
                              onChange={(event) =>
                                setExerciseNameDrafts((current) => ({
                                  ...current,
                                  [exercise.exerciseId]: event.target.value
                                }))
                              }
                              onBlur={() => handleRenameExercise(activeWorkout.id, exercise.exerciseId)}
                              className="mt-3 h-14 w-full rounded-[18px] border px-4 text-[1.05rem] font-semibold outline-none"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                              placeholder="Choose or type an exercise"
                            />
                          </label>

                          <div
                            className="flex min-h-[104px] flex-col justify-between rounded-[24px] border px-5 py-4"
                            style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
                          >
                            <div>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                                Swap
                              </p>
                              <p className="mt-2 text-sm leading-6">Pick from the library or type a variation on the fly.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRenameExercise(activeWorkout.id, exercise.exerciseId)}
                              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-[16px] border px-4 text-sm font-semibold"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
                            >
                              Update exercise
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(activeWorkout.id, exercise.exerciseId)}
                            disabled={activeWorkout.exercises.length <= 1}
                            className="min-h-[104px] rounded-[24px] border px-5 text-sm font-semibold"
                            style={{
                              borderColor: activeWorkout.exercises.length <= 1 ? "var(--app-border)" : "rgba(190,50,50,0.22)",
                              background: activeWorkout.exercises.length <= 1 ? "var(--app-panel-solid)" : "rgba(190,50,50,0.08)",
                              color: activeWorkout.exercises.length <= 1 ? "var(--app-text-muted)" : "#c45151"
                            }}
                          >
                            {activeWorkout.exercises.length <= 1 ? "Keep one exercise" : "Remove exercise"}
                          </button>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto]">
                          <div className="rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            <div className="flex items-center justify-between">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                                Weight
                              </p>
                              <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                                lb
                              </span>
                            </div>
                            <input
                              inputMode="decimal"
                              value={draft.weight}
                              onChange={(event) => updateDraft(exercise.exerciseId, "weight", event.target.value)}
                              className="mt-3 h-14 w-full rounded-[18px] border px-4 text-3xl font-semibold tracking-[-0.05em] outline-none"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                              placeholder="0"
                            />
                            <div className="mt-3 grid grid-cols-4 gap-2">
                              {WEIGHT_STEPS.map((step) => (
                                <button
                                  key={step}
                                  type="button"
                                  onClick={() => adjustDraft(exercise.exerciseId, "weight", step)}
                                  className="min-h-11 rounded-[16px] border text-sm font-semibold"
                                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}
                                >
                                  {step > 0 ? "+" : ""}
                                  {step}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            <div className="flex items-center justify-between">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                                Reps
                              </p>
                              <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                                count
                              </span>
                            </div>
                            <input
                              inputMode="numeric"
                              value={draft.reps}
                              onChange={(event) => updateDraft(exercise.exerciseId, "reps", event.target.value)}
                              className="mt-3 h-14 w-full rounded-[18px] border px-4 text-3xl font-semibold tracking-[-0.05em] outline-none"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                              placeholder="8"
                            />
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {REP_STEPS.map((step) => (
                                <button
                                  key={step}
                                  type="button"
                                  onClick={() => adjustDraft(exercise.exerciseId, "reps", step)}
                                  className="min-h-11 rounded-[16px] border text-sm font-semibold"
                                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}
                                >
                                  {step > 0 ? "+" : ""}
                                  {step}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLogSet(activeWorkout.id, exercise.exerciseId)}
                            disabled={!parsePositiveNumber(draft.weight) || !parsePositiveNumber(draft.reps)}
                            className="min-h-[170px] rounded-[24px] px-6 text-left text-white transition disabled:cursor-not-allowed lg:min-w-[180px]"
                            style={{
                              transform: isJustLogged ? "scale(0.985)" : "scale(1)",
                              background:
                                !parsePositiveNumber(draft.weight) || !parsePositiveNumber(draft.reps)
                                  ? "var(--app-text-muted)"
                                  : isJustLogged
                                    ? "linear-gradient(160deg, #20b15a, #169149)"
                                    : "linear-gradient(160deg, var(--app-accent), var(--app-accent-strong))",
                              boxShadow: isJustLogged ? "0 16px 38px rgba(22,145,73,0.28)" : "0 16px 36px var(--app-accent-glow)"
                            }}
                          >
                            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/70">
                              {isJustLogged ? "Saved" : "Quick Log"}
                            </span>
                            <span className="mt-3 block text-3xl font-semibold tracking-[-0.05em]">
                              {isJustLogged ? "Logged" : "Log set"}
                            </span>
                            <span className="mt-3 block text-sm text-white/80">
                              {isJustLogged
                                ? "Set captured. Stay on this lift or open the next one in queue."
                                : "Keeps the same numbers loaded so the next tap is even faster."}
                            </span>
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {exercise.sets.length > 0 ? (
                            exercise.sets.map((set, setIndex) => (
                              <button
                                key={set.id}
                                type="button"
                                onClick={() => {
                                  setSelectedExerciseId(exercise.exerciseId);
                                  setDrafts((current) => ({
                                    ...current,
                                    [exercise.exerciseId]: {
                                      weight: `${set.weight}`,
                                      reps: `${set.reps}`
                                    }
                                  }));
                                }}
                                className="rounded-full border px-3 py-2 text-sm font-medium transition"
                                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                              >
                                Set {setIndex + 1} · {formatWeight(set.weight)} x {set.reps}
                              </button>
                            ))
                          ) : (
                            <div className="rounded-full border border-dashed px-3 py-2 text-sm" style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)" }}>
                              Your first logged set will stay loaded for quick repeats.
                            </div>
                          )}
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                          <div className="rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                                Last Note
                              </p>
                            </div>
                            <p className="mt-3 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                              {previousReference?.note || "No saved note yet for this lift."}
                            </p>
                          </div>

                          <label className="block rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                            <div className="flex items-center gap-2">
                              <NotebookPen className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                                Note For Next Time
                              </span>
                            </div>
                            <textarea
                              value={exercise.note}
                              onChange={(event) =>
                                setStore((current) => updateExerciseNote(current, activeWorkout.id, exercise.exerciseId, event.target.value))
                              }
                              placeholder="Grip felt better slightly wider. Keep rest times tighter. Left shoulder warmed up slowly."
                              className="mt-3 min-h-28 w-full resize-none rounded-[18px] border px-4 py-3 text-sm leading-6 outline-none"
                              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>

            <section
              className="rounded-[30px] border p-4 sm:p-5"
              style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Add Exercise Mid-Workout
                </p>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  list="lift-log-exercise-library"
                  value={newExerciseName}
                  onChange={(event) => setNewExerciseName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddExercise(activeWorkout.id);
                    }
                  }}
                  className="h-14 w-full rounded-[18px] border px-4 text-[1.02rem] font-medium outline-none"
                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                  placeholder="Search the library or type a new exercise"
                />
                <button
                  type="button"
                  onClick={() => handleAddExercise(activeWorkout.id)}
                  className="min-h-14 rounded-[18px] px-5 text-sm font-semibold text-white"
                  style={{ background: "var(--app-accent)", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                >
                  Add exercise
                </button>
              </div>
              <p className="mt-3 text-[0.95rem] leading-7 sm:text-sm sm:leading-6" style={{ color: "var(--app-text-soft)" }}>
                Use this if a machine is taken, you change variations on the fly, or you want to slot in a bonus movement without rebuilding the template.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[30px] border p-5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Progression
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                {selectedExercise?.exerciseName ?? "Pick an exercise"}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                Tap any exercise card to see its recent history. Tap a past set in the session to reload it instantly.
              </p>

              <div className="mt-5 space-y-3">
                {selectedHistory.length > 0 ? (
                  selectedHistory.map((item) => (
                    <article key={item.workoutId} className="rounded-[22px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{formatWorkoutDateLabel(item.date, today)}</p>
                          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>
                            {item.templateName}
                          </p>
                        </div>
                        <div
                          className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                          style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
                        >
                          {item.setCount} sets
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[18px] px-3 py-3" style={{ background: "var(--app-panel-solid)" }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>
                            Best
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                            {item.bestSet ? `${formatWeight(item.bestSet.weight)} x ${item.bestSet.reps}` : "—"}
                          </p>
                        </div>
                        <div className="rounded-[18px] px-3 py-3" style={{ background: "var(--app-panel-solid)" }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>
                            Latest
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                            {item.latestSet ? `${formatWeight(item.latestSet.weight)} x ${item.latestSet.reps}` : "—"}
                          </p>
                        </div>
                      </div>
                      {item.note ? (
                        <div className="mt-3 rounded-[18px] px-3 py-3 text-sm leading-6" style={{ background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}>
                          {item.note}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div
                    className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-6"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                  >
                    History appears here automatically as soon as you log this exercise.
                  </div>
                )}
              </div>
            </section>

            <section
              className="rounded-[30px] border p-5"
              style={{ borderColor: "var(--app-border)", background: "linear-gradient(145deg, var(--app-accent-soft), var(--app-panel-muted))", boxShadow: "var(--app-shadow)" }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
                style={{ background: "var(--app-panel-solid)", color: "var(--app-accent)" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Built For Speed
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                <p>Every exercise remembers its last logged set, so most entries are just one tap.</p>
                <p>Weight steps use the most common jumps to reduce keyboard time without boxing you in.</p>
                <p>Templates seed the app on first open, so the first session takes seconds instead of setup.</p>
              </div>
            </section>
          </aside>
        </section>
        </>
      );
    }

    return (
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article
          className="rounded-[32px] border p-6 sm:p-7"
          style={{
            borderColor: "var(--app-border)",
            background: "linear-gradient(145deg, color-mix(in srgb, var(--app-panel-strong) 92%, var(--app-accent) 8%), var(--app-panel-strong))",
            boxShadow: "var(--app-shadow)",
            color: "var(--app-on-strong)"
          }}
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
            Ready To Train
          </p>
          <h2 className="mt-3 text-[2.4rem] font-semibold tracking-[-0.07em] sm:text-[3rem]">Start from a template when you’re ready.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 sm:text-base" style={{ color: "var(--app-text-soft)" }}>
            Use the views above like app tabs. Today keeps you focused, Templates is for setup, Calendar is for date-based recall,
            and Logs is the full archive.
          </p>
        </article>

        <article className="rounded-[32px] border p-6" style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
              How It Flows
            </p>
          </div>
          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
              <p className="text-sm font-semibold">1. Today for training</p>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                Active workout and quick logging stay front and center.
              </p>
            </div>
            <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
              <p className="text-sm font-semibold">2. Templates for setup</p>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                Build or edit splits without making the workout screen long.
              </p>
            </div>
            <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
              <p className="text-sm font-semibold">3. Calendar for recall</p>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                Tap a day and immediately see what you trained.
              </p>
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className={`mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-7 ${activeWorkout ? "pb-60 sm:pb-7" : "pb-28 sm:pb-7"}`}>
        <header
          className="rounded-[28px] border px-4 py-4 sm:hidden"
          style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
              style={{ background: "var(--app-panel-strong)", color: "var(--app-on-strong)" }}
            >
              <Dumbbell className="h-3.5 w-3.5" />
              Lift Log
            </div>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" style={{ color: "var(--app-accent)" }} /> : <Moon className="h-4 w-4" style={{ color: "var(--app-accent)" }} />}
            </button>
          </div>

          {!activeWorkout ? (
            <>
              <h1 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.07em]">Lift faster.</h1>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                Templates, history, and calendar stay organized. Workouts stay focused once you start.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openCalendar(today)}
                  className="rounded-[22px] border px-4 py-3 text-left"
                  style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Today
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{formatDisplayDate(today)}</p>
                </button>

                <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Templates
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.templates.length}</p>
                </div>

                <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Logs
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.logs.length}</p>
                </div>

                <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Sync
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-[-0.04em]">
                    {syncStatus === "synced" ? "Ready" : syncAvailable ? "Local first" : "Needs keys"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
              Active session loaded. Everything below is tuned for quick one-hand logging.
            </p>
          )}
        </header>

        <header
          className="hidden rounded-[30px] border px-5 py-5 backdrop-blur sm:block sm:px-7"
          style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
                style={{ background: "var(--app-panel-strong)", color: "var(--app-on-strong)" }}
              >
                <Dumbbell className="h-3.5 w-3.5" />
                Lift Log
              </div>
              <h1 className="mt-4 text-[2.3rem] font-semibold tracking-[-0.07em] sm:text-[3.6rem]">Fast enough to use between sets.</h1>
          <p className="mt-3 max-w-xl text-[0.98rem] leading-7 sm:text-base sm:leading-6" style={{ color: "var(--app-text-soft)" }}>
            The app now works more like a lightweight multi-screen product: focused sections, less vertical wandering, and a
            calendar you can actually use.
          </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[640px] xl:grid-cols-5">
              <button
                type="button"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="rounded-[22px] border px-4 py-3 text-left"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" style={{ color: "var(--app-accent)" }} /> : <Moon className="h-4 w-4" style={{ color: "var(--app-accent)" }} />}
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Theme
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{theme === "dark" ? "Dark" : "Light"}</p>
              </button>

              <button
                type="button"
                onClick={() => openCalendar(today)}
                className="rounded-[22px] border px-4 py-3 text-left"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
              >
                <CalendarRange className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Today
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{formatDisplayDate(today)}</p>
              </button>

              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <Dumbbell className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Templates
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.templates.length}</p>
              </div>

              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <History className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Logs
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.logs.length}</p>
              </div>

              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <div className="flex items-center justify-between gap-3">
                  {syncAvailable ? <Cloud className="h-4 w-4" style={{ color: "var(--app-accent)" }} /> : <CloudOff className="h-4 w-4" style={{ color: "var(--app-text-muted)" }} />}
                  <span
                    className="rounded-full px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      background:
                        syncStatus === "synced"
                          ? "var(--app-accent-soft)"
                          : syncStatus === "error"
                            ? "rgba(190,50,50,0.08)"
                            : "var(--app-panel-solid)",
                      color: syncStatus === "error" ? "#c45151" : syncStatus === "synced" ? "var(--app-accent)" : "var(--app-text-soft)"
                    }}
                  >
                    {syncStatus === "synced"
                      ? "Synced"
                      : syncStatus === "syncing"
                        ? "Syncing"
                        : syncStatus === "checking"
                          ? "Checking"
                          : syncStatus === "error"
                            ? "Error"
                            : "Local"}
                  </span>
                </div>
                <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Cloud Sync
                </p>
                <p className="mt-2 text-base font-semibold tracking-[-0.04em]">
                  {syncUserEmail || (syncAvailable ? "Protect your logs" : "Needs keys")}
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                  {syncUserEmail
                    ? "This device now shares templates and logs through Supabase."
                    : syncAvailable
                      ? "Connect email once and your logs stop feeling temporary."
                      : "Add Supabase env vars to enable cloud backup."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
            <ViewButton active={view === "today"} onClick={() => setView("today")} icon={<Play className="h-4 w-4" />}>
              Today
            </ViewButton>
            <ViewButton active={view === "templates"} onClick={() => setView("templates")} icon={<Dumbbell className="h-4 w-4" />}>
              Templates
            </ViewButton>
            <ViewButton active={view === "calendar"} onClick={() => openCalendar(selectedCalendarDate)} icon={<CalendarDays className="h-4 w-4" />}>
              Calendar
            </ViewButton>
            <ViewButton active={view === "logs"} onClick={() => setView("logs")} icon={<History className="h-4 w-4" />}>
              Logs
            </ViewButton>
          </div>
        </header>

        <div className="mt-4 flex flex-1 flex-col gap-4">
          <section
            className="rounded-[28px] border p-4 sm:p-5"
            style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  {syncAvailable ? <Cloud className="h-4 w-4" style={{ color: "var(--app-accent)" }} /> : <CloudOff className="h-4 w-4" style={{ color: "var(--app-text-muted)" }} />}
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Backup & Sync
                  </p>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                  {syncUserEmail ? `Connected as ${syncUserEmail}` : "Keep your logs safe across devices."}
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
                  {syncAvailable
                    ? "Lift Log stays fast on-device first, then quietly syncs to the cloud in the background."
                    : "The sync layer is implemented. Add your Supabase keys and run the SQL migration to turn it on."}
                </p>
                {syncMessage ? (
                  <p className="mt-3 text-sm leading-6" style={{ color: syncStatus === "error" ? "#c45151" : "var(--app-text-soft)" }}>
                    {syncMessage}
                  </p>
                ) : null}
              </div>

              {syncAvailable ? (
                syncUserEmail ? (
                  <button
                    type="button"
                    onClick={handleSignOutSync}
                    disabled={syncBusy}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}
                  >
                    {syncBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    Disconnect
                  </button>
                ) : (
                  <div className="w-full max-w-md rounded-[24px] border p-3 sm:p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="email"
                        value={syncEmail}
                        onChange={(event) => setSyncEmail(event.target.value)}
                        className="h-12 flex-1 rounded-[16px] border px-4 text-sm outline-none"
                        style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text)" }}
                        placeholder="you@example.com"
                      />
                      <button
                        type="button"
                        onClick={handleSendMagicLink}
                        disabled={syncBusy || !syncEmail.trim()}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed"
                        style={{ background: "var(--app-accent)", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                      >
                        {syncBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                        Send magic link
                      </button>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </section>

          {view === "today" ? renderTodayView() : null}
          {view === "templates" ? renderTemplatesSection() : null}
          {view === "calendar" ? renderCalendarSection() : null}
          {view === "logs"
            ? renderLogsSection(recentLogs, "Your recent sessions are right here.", "Review what you did, skim saved notes, and delete old sessions you do not want to keep.")
            : null}
        </div>

        <datalist id="lift-log-exercise-library">
          {store.exerciseLibrary.map((exerciseName) => (
            <option key={exerciseName} value={exerciseName} />
          ))}
        </datalist>

        {templateEditor ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
            <div
              className="w-full max-w-xl rounded-[32px] border p-5 sm:p-6"
              style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", boxShadow: "0 30px 120px rgba(15,15,15,0.24)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                    Template
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{templateEditor.id ? "Edit template" : "New template"}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setTemplateEditor(null)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold"
                  style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)" }}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium" style={{ color: "var(--app-text-soft)" }}>
                    Template name
                  </span>
                  <input
                    value={templateEditor.name}
                    onChange={(event) => setTemplateEditor((current) => (current ? { ...current, name: event.target.value } : current))}
                    className="h-14 w-full rounded-[20px] border px-4 text-lg font-medium outline-none"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text)" }}
                    placeholder="Push Day"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium" style={{ color: "var(--app-text-soft)" }}>
                    Exercises
                  </span>
                  <textarea
                    value={templateEditor.exercises}
                    onChange={(event) =>
                      setTemplateEditor((current) => (current ? { ...current, exercises: event.target.value } : current))
                    }
                    className="min-h-52 w-full rounded-[20px] border px-4 py-4 text-base outline-none"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text)" }}
                    placeholder={"Bench Press\nIncline Dumbbell Press\nCable Fly"}
                  />
                  <p className="mt-2 text-sm" style={{ color: "var(--app-text-soft)" }}>
                    One exercise per line keeps creation fast and editable.
                  </p>
                </label>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setTemplateEditor(null)}
                  className="min-h-12 rounded-full border px-5 text-sm font-semibold"
                  style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="min-h-12 rounded-full px-5 text-sm font-semibold text-white"
                  style={{ background: "var(--app-accent)", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
                >
                  Save template
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!activeWorkout ? (
          <nav
            className="fixed inset-x-0 z-40 mx-auto w-full max-w-7xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden"
            style={{ bottom: 0 }}
          >
            <div
              className="grid grid-cols-4 gap-2 rounded-[28px] border p-2 shadow-[0_24px_70px_rgba(15,15,15,0.22)] backdrop-blur"
              style={{ borderColor: "var(--app-border)", background: "color-mix(in srgb, var(--app-panel) 92%, transparent)" }}
            >
              {[
                { key: "today" as const, label: "Today", icon: <Play className="h-4 w-4" /> },
                { key: "templates" as const, label: "Templates", icon: <Dumbbell className="h-4 w-4" /> },
                { key: "calendar" as const, label: "Calendar", icon: <CalendarDays className="h-4 w-4" /> },
                { key: "logs" as const, label: "Logs", icon: <History className="h-4 w-4" /> }
              ].map((item) => {
                const isActive = view === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => (item.key === "calendar" ? openCalendar(selectedCalendarDate) : setView(item.key))}
                    className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[20px] text-xs font-semibold transition"
                    style={{
                      background: isActive ? "var(--app-accent)" : "transparent",
                      color: isActive ? "#ffffff" : "var(--app-text-soft)",
                      boxShadow: isActive ? "0 12px 30px var(--app-accent-glow)" : "none"
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
