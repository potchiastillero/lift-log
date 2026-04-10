"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  Check,
  ChevronRight,
  Dumbbell,
  History,
  Moon,
  NotebookPen,
  PencilLine,
  Play,
  Plus,
  Sparkles,
  Sun,
  TimerReset,
  Trash2
} from "lucide-react";
import {
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
  readLiftStore,
  startWorkout,
  updateExerciseNote,
  upsertTemplate
} from "@/lib/lift-log/store";
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

const WEIGHT_STEPS = [-5, -2.5, 2.5, 5];
const REP_STEPS = [-1, 1];
const THEME_STORAGE_KEY = "lift-log-theme";

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

export function LiftLogApp() {
  const [store, setStore] = useState<LiftStore>({ version: 4, templates: [], logs: [] });
  const [loaded, setLoaded] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftSet>>({});
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [templateEditor, setTemplateEditor] = useState<TemplateEditorState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const today = formatTodayDate(now);
  const activeWorkout = getActiveWorkout(store, today);
  const selectedExercise = activeWorkout?.exercises.find((exercise) => exercise.exerciseId === selectedExerciseId) ?? activeWorkout?.exercises[0] ?? null;
  const selectedHistory = selectedExercise ? getExerciseHistory(store, selectedExercise.exerciseName) : [];
  const workoutCompletion = activeWorkout ? getWorkoutCompletion(activeWorkout) : null;
  const recentLogs = [...store.logs].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  useEffect(() => {
    const nextStore = readLiftStore();
    setStore(nextStore);
    setLoaded(true);
  }, []);

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

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-7">
        <header
          className="rounded-[30px] border px-5 py-5 backdrop-blur sm:px-7"
          style={{
            borderColor: "var(--app-border)",
            background: "var(--app-panel)",
            boxShadow: "var(--app-shadow)"
          }}
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
              <h1 className="mt-4 text-[2.3rem] font-semibold tracking-[-0.07em] sm:text-[3.6rem]">
                Fast enough to use between sets.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 sm:text-base" style={{ color: "var(--app-text-soft)" }}>
                Start from a template, tap in weight and reps, and keep moving. No setup maze, no bloated dashboard, no
                digging for the last session.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[560px]">
              <button
                type="button"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="rounded-[22px] border px-4 py-3 text-left"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                ) : (
                  <Moon className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                )}
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>
                  Theme
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{theme === "dark" ? "Dark" : "Light"}</p>
              </button>
              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <CalendarRange className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Today</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{formatDisplayDate(today)}</p>
              </div>
              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <Dumbbell className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Templates</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.templates.length}</p>
              </div>
              <div className="rounded-[22px] border px-4 py-3" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                <History className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Logs</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{store.logs.length}</p>
              </div>
            </div>
          </div>
        </header>

        <section
          className="mt-4 rounded-[30px] border p-4 backdrop-blur sm:p-5"
          style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Templates</p>
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

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {store.templates.map((template) => (
              <article
                key={template.id}
                className="rounded-[26px] border p-4"
                style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
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
                    <p className="mt-1 text-sm" style={{ color: "var(--app-text-soft)" }}>{template.exercises.length} exercises</p>
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
                      style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}
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

        {activeWorkout ? (
          <section className="mt-4 grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
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
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Active Workout</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{activeWorkout.templateName}</h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm" style={{ color: "var(--app-text-soft)" }}>
                      <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>{formatDisplayDate(activeWorkout.date)}</span>
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
                    style={{ background: "var(--app-accent)", color: "white", boxShadow: "0 12px 30px var(--app-accent-glow)" }}
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

                  return (
                    <article
                      key={exercise.exerciseId}
                      className="rounded-[30px] border p-4 transition sm:p-5"
                      style={{
                        borderColor: selectedExerciseId === exercise.exerciseId ? "var(--app-accent)" : "var(--app-border)",
                        background: selectedExerciseId === exercise.exerciseId ? "var(--app-panel-solid)" : "var(--app-panel)",
                        boxShadow:
                          selectedExerciseId === exercise.exerciseId
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
                              <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-accent-glow)", background: "var(--app-note-soft)", color: "var(--app-accent)" }}>
                                Last note saved
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedExerciseId(exercise.exerciseId);
                          }}
                          className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border px-4 text-sm font-medium transition"
                          style={{ borderColor: "var(--app-border)", color: "var(--app-text-soft)", background: "var(--app-panel-solid)" }}
                        >
                          History
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto]">
                        <div className="rounded-[24px] border p-4" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)" }}>
                          <div className="flex items-center justify-between">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Weight</p>
                            <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>lb</span>
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
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Reps</p>
                            <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>count</span>
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
                            background:
                              !parsePositiveNumber(draft.weight) || !parsePositiveNumber(draft.reps)
                                ? "var(--app-text-muted)"
                                : "linear-gradient(160deg, var(--app-accent), var(--app-accent-strong))",
                            boxShadow: "0 16px 36px var(--app-accent-glow)"
                          }}
                        >
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/70">Quick Log</span>
                          <span className="mt-3 block text-3xl font-semibold tracking-[-0.05em]">Log set</span>
                          <span className="mt-3 block text-sm text-white/80">
                            Keeps the same numbers loaded so the next tap is even faster.
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
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Last Note</p>
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
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-[30px] border p-5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Progression</p>
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
                            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>{item.templateName}</p>
                          </div>
                          <div className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-soft)" }}>
                            {item.setCount} sets
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-[18px] px-3 py-3" style={{ background: "var(--app-panel-solid)" }}>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>Best</p>
                            <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                              {item.bestSet ? `${formatWeight(item.bestSet.weight)} x ${item.bestSet.reps}` : "—"}
                            </p>
                          </div>
                          <div className="rounded-[18px] px-3 py-3" style={{ background: "var(--app-panel-solid)" }}>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--app-text-muted)" }}>Latest</p>
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
                    <div className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-6" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}>
                      History appears here automatically as soon as you log this exercise.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[30px] border p-5" style={{ borderColor: "var(--app-border)", background: "linear-gradient(145deg, var(--app-accent-soft), var(--app-panel-muted))", boxShadow: "var(--app-shadow)" }}>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]" style={{ background: "var(--app-panel-solid)", color: "var(--app-accent)" }}>
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
        ) : (
          <section className="mt-4 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <article className="rounded-[32px] border p-6 sm:p-7" style={{ borderColor: "var(--app-border)", background: "linear-gradient(145deg, color-mix(in srgb, var(--app-panel-strong) 92%, var(--app-accent) 8%), var(--app-panel-strong))", boxShadow: "var(--app-shadow)", color: "var(--app-on-strong)" }}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Ready To Train</p>
              <h2 className="mt-3 text-[2.4rem] font-semibold tracking-[-0.07em] sm:text-[3rem]">
                Start from a template when you’re ready.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 sm:text-base" style={{ color: "var(--app-text-soft)" }}>
                Once a workout starts, every exercise card preloads the last weight and reps you used for that movement.
                That means less typing when you’re already breathing hard.
              </p>
            </article>

            <article className="rounded-[32px] border p-6" style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>How It Flows</p>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
                  <p className="text-sm font-semibold">1. Choose a template</p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>Workout A, B, C, or your own split.</p>
                </div>
                <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
                  <p className="text-sm font-semibold">2. Log weight and reps fast</p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>Large controls, quick jumps, and no extra screens.</p>
                </div>
                <div className="rounded-[22px] p-4" style={{ background: "var(--app-panel-muted)" }}>
                  <p className="text-sm font-semibold">3. Glance at progression</p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>Recent bests and latest sets stay one tap away.</p>
                </div>
              </div>
            </article>
          </section>
        )}

        <section className="mt-4 rounded-[30px] border p-4 backdrop-blur sm:p-5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel)", boxShadow: "var(--app-shadow)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" style={{ color: "var(--app-accent)" }} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Previous Logs</p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Your recent sessions are right here.</h2>
            </div>
            <p className="max-w-md text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>
              Review what you did, skim saved notes, and delete old sessions you do not want to keep.
            </p>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
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
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", color: "var(--app-text-muted)" }}>
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
                      <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}>{setCount} logged sets</span>
                      <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)" }}>{noteCount} notes</span>
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
                            <p className="mt-2 text-sm leading-6" style={{ color: "var(--app-text-soft)" }}>{exercise.note}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed px-4 py-5 text-sm leading-6" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text-soft)" }}>
                Finished workouts will appear here once you log them.
              </div>
            )}
          </div>
        </section>

        {templateEditor ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-xl rounded-[32px] border p-5 sm:p-6" style={{ borderColor: "var(--app-border)", background: "var(--app-panel-solid)", boxShadow: "0 30px 120px rgba(15,15,15,0.24)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--app-text-muted)" }}>Template</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
                    {templateEditor.id ? "Edit template" : "New template"}
                  </h2>
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
                  <span className="mb-2 block text-sm font-medium" style={{ color: "var(--app-text-soft)" }}>Template name</span>
                  <input
                    value={templateEditor.name}
                    onChange={(event) =>
                      setTemplateEditor((current) => (current ? { ...current, name: event.target.value } : current))
                    }
                    className="h-14 w-full rounded-[20px] border px-4 text-lg font-medium outline-none"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text)" }}
                    placeholder="Push Day"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium" style={{ color: "var(--app-text-soft)" }}>Exercises</span>
                  <textarea
                    value={templateEditor.exercises}
                    onChange={(event) =>
                      setTemplateEditor((current) => (current ? { ...current, exercises: event.target.value } : current))
                    }
                    className="min-h-52 w-full rounded-[20px] border px-4 py-4 text-base outline-none"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-panel-muted)", color: "var(--app-text)" }}
                    placeholder={"Bench Press\nIncline Dumbbell Press\nCable Fly"}
                  />
                  <p className="mt-2 text-sm" style={{ color: "var(--app-text-soft)" }}>One exercise per line keeps creation fast and editable.</p>
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

        {!loaded ? null : null}
      </div>
    </main>
  );
}
