import type {
  ExerciseHistoryItem,
  LiftStore,
  LoggedSet,
  PreviousExerciseReference,
  TemplateExercise,
  WorkoutExerciseLog,
  WorkoutLog,
  WorkoutTemplate
} from "@/lib/lift-log/types";

export const LIFT_LOG_STORAGE_KEY = "lift-log-store";

const DEFAULT_TEMPLATES = [
  {
    name: "Workout A",
    exercises: ["Bench Press", "Chest-Supported Row", "Hack Squat", "Cable Pushdown"]
  },
  {
    name: "Workout B",
    exercises: ["Incline Dumbbell Press", "Pull-Up", "Romanian Deadlift", "Lateral Raise"]
  },
  {
    name: "Workout C",
    exercises: ["Overhead Press", "Lat Pulldown", "Leg Press", "Hammer Curl"]
  }
] as const;

const EMPTY_STORE: LiftStore = {
  version: 6,
  updatedAt: new Date(0).toISOString(),
  exerciseLibrary: DEFAULT_TEMPLATES.flatMap((template) => template.exercises),
  templates: DEFAULT_TEMPLATES.map((template) => createTemplateRecord(template.name, template.exercises)),
  logs: []
};

type LegacyParsedWorkoutEntry = {
  id: string;
  date: string;
  lineIndex: number;
  exercise: string;
  exerciseKey: string;
  weight: number;
  reps: number;
  raw: string;
};

type LegacyWorkoutDay = {
  date: string;
  content: string;
  updatedAt: string;
  parsedEntries: LegacyParsedWorkoutEntry[];
};

type LegacyLiftStore = {
  version?: number;
  days?: LegacyWorkoutDay[];
  sessions?: Array<{
    date: string;
    entries: Array<{
      exercise: string;
      weight: number;
      reps: number;
      createdAt: string;
    }>;
  }>;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatTodayDate(now: Date = new Date()) {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(parsed);
}

export function formatWeight(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function formatDuration(startedAt: string, now: Date = new Date()) {
  const elapsedMs = Math.max(0, now.getTime() - new Date(startedAt).getTime());
  const totalMinutes = Math.round(elapsedMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function sanitizeExerciseName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildExerciseLibrary(templates: WorkoutTemplate[], logs: WorkoutLog[], existing: string[] = []) {
  const unique = new Set<string>();

  for (const name of existing) {
    const sanitized = sanitizeExerciseName(name);
    if (sanitized) {
      unique.add(sanitized);
    }
  }

  for (const template of templates) {
    for (const exercise of template.exercises) {
      unique.add(sanitizeExerciseName(exercise.name));
    }
  }

  for (const log of logs) {
    for (const exercise of log.exercises) {
      unique.add(sanitizeExerciseName(exercise.exerciseName));
    }
  }

  return [...unique].sort((a, b) => a.localeCompare(b));
}

function getLatestEntityTimestamp(store: Pick<LiftStore, "templates" | "logs">) {
  const timestamps = [
    ...store.templates.flatMap((template) => [template.createdAt, template.updatedAt]),
    ...store.logs.flatMap((log) => [log.startedAt, log.completedAt ?? "", ...log.exercises.flatMap((exercise) => exercise.sets.map((set) => set.completedAt))])
  ].filter(Boolean);

  return timestamps.sort((a, b) => b.localeCompare(a))[0] ?? new Date(0).toISOString();
}

function stampStore(store: Omit<LiftStore, "updatedAt" | "version">, updatedAt: string = new Date().toISOString()): LiftStore {
  return {
    version: 6,
    updatedAt,
    exerciseLibrary: store.exerciseLibrary,
    templates: store.templates,
    logs: store.logs
  };
}

function createTemplateRecord(name: string, exercises: readonly string[], now: Date = new Date()): WorkoutTemplate {
  const timestamp = now.toISOString();

  return {
    id: createId("template"),
    name: name.trim(),
    exercises: exercises
      .map((exercise) => sanitizeExerciseName(exercise))
      .filter(Boolean)
      .map((exercise) => ({
        id: createId("exercise"),
        name: exercise
      })),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function sanitizeTemplateExercise(exercise: Partial<TemplateExercise>): TemplateExercise | null {
  const name = sanitizeExerciseName(exercise.name ?? "");

  if (!name) {
    return null;
  }

  return {
    id: typeof exercise.id === "string" && exercise.id ? exercise.id : createId("exercise"),
    name
  };
}

function sanitizeLoggedSet(entry: Partial<LoggedSet>): LoggedSet | null {
  const weight = Number(entry.weight);
  const reps = Number(entry.reps);

  if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) {
    return null;
  }

  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : createId("set"),
    weight,
    reps,
    completedAt: typeof entry.completedAt === "string" ? entry.completedAt : new Date().toISOString()
  };
}

function sanitizeWorkoutExerciseLog(entry: Partial<WorkoutExerciseLog>): WorkoutExerciseLog | null {
  const exerciseName = sanitizeExerciseName(entry.exerciseName ?? "");

  if (!exerciseName) {
    return null;
  }

  return {
    exerciseId: typeof entry.exerciseId === "string" && entry.exerciseId ? entry.exerciseId : createId("exercise-log"),
    exerciseName,
    note: typeof entry.note === "string" ? entry.note.trim() : "",
    sets: Array.isArray(entry.sets)
      ? entry.sets.map((set) => sanitizeLoggedSet(set)).filter((set): set is LoggedSet => set !== null)
      : []
  };
}

function sanitizeTemplate(entry: Partial<WorkoutTemplate>): WorkoutTemplate | null {
  const name = (entry.name ?? "").trim();

  if (!name) {
    return null;
  }

  const exercises = Array.isArray(entry.exercises)
    ? entry.exercises
        .map((exercise) => sanitizeTemplateExercise(exercise))
        .filter((exercise): exercise is TemplateExercise => exercise !== null)
    : [];

  if (exercises.length === 0) {
    return null;
  }

  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : createId("template"),
    name,
    exercises,
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString()
  };
}

function sanitizeWorkoutLog(entry: Partial<WorkoutLog>): WorkoutLog | null {
  if (typeof entry.date !== "string" || typeof entry.templateName !== "string" || typeof entry.startedAt !== "string") {
    return null;
  }

  const exercises = Array.isArray(entry.exercises)
    ? entry.exercises
        .map((exercise) => sanitizeWorkoutExerciseLog(exercise))
        .filter((exercise): exercise is WorkoutExerciseLog => exercise !== null)
    : [];

  if (exercises.length === 0) {
    return null;
  }

  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : createId("workout"),
    date: entry.date,
    templateId: typeof entry.templateId === "string" ? entry.templateId : "imported",
    templateName: entry.templateName.trim() || "Imported Workout",
    startedAt: entry.startedAt,
    completedAt: typeof entry.completedAt === "string" ? entry.completedAt : null,
    exercises
  };
}

function migrateLegacyStore(store: LegacyLiftStore): LiftStore {
  const migratedLogs: WorkoutLog[] = [];

  if (Array.isArray(store.days)) {
    for (const day of store.days) {
      const groupedExercises = new Map<string, WorkoutExerciseLog>();

      for (const entry of day.parsedEntries ?? []) {
        if (!groupedExercises.has(entry.exerciseKey)) {
          groupedExercises.set(entry.exerciseKey, {
            exerciseId: createId("exercise-log"),
            exerciseName: sanitizeExerciseName(entry.exercise),
            note: "",
            sets: []
          });
        }

        groupedExercises.get(entry.exerciseKey)?.sets.push({
          id: createId("set"),
          weight: entry.weight,
          reps: entry.reps,
          completedAt: day.updatedAt
        });
      }

      if (groupedExercises.size > 0) {
        migratedLogs.push({
          id: createId("workout"),
          date: day.date,
          templateId: "imported",
          templateName: "Imported Workout",
          startedAt: day.updatedAt,
          completedAt: day.updatedAt,
          exercises: [...groupedExercises.values()]
        });
      }
    }
  }

  if (Array.isArray(store.sessions)) {
    for (const session of store.sessions) {
      const groupedExercises = new Map<string, WorkoutExerciseLog>();

      for (const entry of session.entries ?? []) {
        const key = sanitizeExerciseName(entry.exercise).toLowerCase();

        if (!groupedExercises.has(key)) {
          groupedExercises.set(key, {
            exerciseId: createId("exercise-log"),
            exerciseName: sanitizeExerciseName(entry.exercise),
            note: "",
            sets: []
          });
        }

        groupedExercises.get(key)?.sets.push({
          id: createId("set"),
          weight: entry.weight,
          reps: entry.reps,
          completedAt: entry.createdAt
        });
      }

      if (groupedExercises.size > 0) {
        migratedLogs.push({
          id: createId("workout"),
          date: session.date,
          templateId: "imported",
          templateName: "Imported Workout",
          startedAt: session.entries[0]?.createdAt ?? new Date(`${session.date}T12:00:00`).toISOString(),
          completedAt:
            session.entries[session.entries.length - 1]?.createdAt ?? new Date(`${session.date}T13:00:00`).toISOString(),
          exercises: [...groupedExercises.values()]
        });
      }
    }
  }

  return {
    version: 6,
    updatedAt: getLatestEntityTimestamp({ templates: EMPTY_STORE.templates, logs: migratedLogs }),
    exerciseLibrary: buildExerciseLibrary(EMPTY_STORE.templates, migratedLogs),
    templates: EMPTY_STORE.templates,
    logs: migratedLogs.sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  };
}

export function readLiftStore(): LiftStore {
  if (typeof window === "undefined") {
    return EMPTY_STORE;
  }

  const raw = window.localStorage.getItem(LIFT_LOG_STORAGE_KEY);

  if (!raw) {
    return EMPTY_STORE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LiftStore> & LegacyLiftStore;

    if (Array.isArray(parsed.templates) || Array.isArray(parsed.logs)) {
      const templates = Array.isArray(parsed.templates)
        ? parsed.templates.map((template) => sanitizeTemplate(template)).filter((template): template is WorkoutTemplate => template !== null)
        : [];
      const logs = Array.isArray(parsed.logs)
        ? parsed.logs.map((log) => sanitizeWorkoutLog(log)).filter((log): log is WorkoutLog => log !== null)
        : [];

      return {
        version: 6,
        updatedAt:
          typeof parsed.updatedAt === "string" && parsed.updatedAt
            ? parsed.updatedAt
            : getLatestEntityTimestamp({ templates: templates.length > 0 ? templates : EMPTY_STORE.templates, logs }),
        exerciseLibrary: buildExerciseLibrary(templates.length > 0 ? templates : EMPTY_STORE.templates, logs, parsed.exerciseLibrary ?? []),
        templates: templates.length > 0 ? templates : EMPTY_STORE.templates,
        logs: logs.sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      };
    }

    if (Array.isArray(parsed.days) || Array.isArray(parsed.sessions)) {
      const migrated = migrateLegacyStore(parsed);
      writeLiftStore(migrated);
      return migrated;
    }
  } catch {
    return EMPTY_STORE;
  }

  return EMPTY_STORE;
}

export function writeLiftStore(store: LiftStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LIFT_LOG_STORAGE_KEY, JSON.stringify(store));
}

function persistStore(store: LiftStore) {
  writeLiftStore(store);
  return store;
}

export function replaceLiftStore(store: LiftStore) {
  return persistStore({
    ...store,
    version: 6,
    updatedAt: store.updatedAt || getLatestEntityTimestamp(store),
    exerciseLibrary: buildExerciseLibrary(store.templates, store.logs, store.exerciseLibrary)
  });
}

function persistStampedStore(store: Omit<LiftStore, "updatedAt" | "version">, now: Date = new Date()) {
  return persistStore(stampStore(store, now.toISOString()));
}

export function upsertTemplate(store: LiftStore, input: { id?: string; name: string; exercises: string[] }, now: Date = new Date()) {
  const name = input.name.trim();
  const exercises = input.exercises.map((exercise) => sanitizeExerciseName(exercise)).filter(Boolean);

  if (!name || exercises.length === 0) {
    return store;
  }

  const existing = input.id ? store.templates.find((template) => template.id === input.id) : null;

  const nextTemplate: WorkoutTemplate = existing
    ? {
        ...existing,
        name,
        exercises: exercises.map((exercise, index) => ({
          id: existing.exercises[index]?.id ?? createId("exercise"),
          name: exercise
        })),
        updatedAt: now.toISOString()
      }
    : createTemplateRecord(name, exercises, now);

  const templates = existing
    ? store.templates.map((template) => (template.id === existing.id ? nextTemplate : template))
    : [nextTemplate, ...store.templates];

  return persistStampedStore({
    ...store,
    exerciseLibrary: buildExerciseLibrary(templates, store.logs, store.exerciseLibrary),
    templates
  }, now);
}

export function startWorkout(store: LiftStore, templateId: string, now: Date = new Date()) {
  const template = store.templates.find((entry) => entry.id === templateId);

  if (!template) {
    return { store, workout: null as WorkoutLog | null };
  }

  const startedAt = now.toISOString();
  const workout: WorkoutLog = {
    id: createId("workout"),
    date: formatTodayDate(now),
    templateId: template.id,
    templateName: template.name,
    startedAt,
    completedAt: null,
    exercises: template.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      note: "",
      sets: []
    }))
  };

  const nextStore = persistStampedStore({
    ...store,
    exerciseLibrary: buildExerciseLibrary(store.templates, [...store.logs, workout], store.exerciseLibrary),
    logs: [...store.logs, workout]
  }, now);

  return { store: nextStore, workout };
}

export function finishWorkout(store: LiftStore, workoutId: string, now: Date = new Date()) {
  return persistStampedStore({
    ...store,
    exerciseLibrary: buildExerciseLibrary(store.templates, store.logs, store.exerciseLibrary),
    logs: store.logs.map((log) =>
      log.id === workoutId
        ? {
            ...log,
            completedAt: log.completedAt ?? now.toISOString()
          }
        : log
    )
  }, now);
}

export function logWorkoutSet(
  store: LiftStore,
  workoutId: string,
  exerciseId: string,
  input: { weight: number; reps: number },
  now: Date = new Date()
) {
  const nextSet: LoggedSet = {
    id: createId("set"),
    weight: input.weight,
    reps: input.reps,
    completedAt: now.toISOString()
  };

  return persistStampedStore({
    ...store,
    exerciseLibrary: buildExerciseLibrary(store.templates, store.logs, store.exerciseLibrary),
    logs: store.logs.map((log) =>
      log.id === workoutId
        ? {
            ...log,
            exercises: log.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId
                ? {
                    ...exercise,
                    sets: [...exercise.sets, nextSet]
                  }
                : exercise
            )
          }
        : log
    )
  }, now);
}

export function updateExerciseNote(store: LiftStore, workoutId: string, exerciseId: string, note: string) {
  return persistStampedStore({
    ...store,
    exerciseLibrary: buildExerciseLibrary(store.templates, store.logs, store.exerciseLibrary),
    logs: store.logs.map((log) =>
      log.id === workoutId
        ? {
            ...log,
            exercises: log.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId
                ? {
                    ...exercise,
                    note
                  }
                : exercise
            )
          }
        : log
    )
  });
}

export function deleteWorkoutLog(store: LiftStore, workoutId: string) {
  return persistStampedStore({
    ...store,
    logs: store.logs.filter((log) => log.id !== workoutId),
    exerciseLibrary: buildExerciseLibrary(store.templates, store.logs.filter((log) => log.id !== workoutId), store.exerciseLibrary)
  });
}

export function renameWorkoutExercise(store: LiftStore, workoutId: string, exerciseId: string, exerciseName: string) {
  const sanitized = sanitizeExerciseName(exerciseName);

  if (!sanitized) {
    return store;
  }

  const logs = store.logs.map((log) =>
    log.id === workoutId
      ? {
          ...log,
          exercises: log.exercises.map((exercise) =>
            exercise.exerciseId === exerciseId
              ? {
                  ...exercise,
                  exerciseName: sanitized
                }
              : exercise
          )
        }
      : log
  );

  return persistStampedStore({
    ...store,
    logs,
    exerciseLibrary: buildExerciseLibrary(store.templates, logs, [...store.exerciseLibrary, sanitized])
  });
}

export function addWorkoutExercise(store: LiftStore, workoutId: string, exerciseName: string) {
  const sanitized = sanitizeExerciseName(exerciseName);

  if (!sanitized) {
    return { store, exerciseId: "" };
  }

  const exerciseId = createId("exercise");
  const logs = store.logs.map((log) =>
    log.id === workoutId
      ? {
          ...log,
          exercises: [
            ...log.exercises,
            {
              exerciseId,
              exerciseName: sanitized,
              note: "",
              sets: []
            }
          ]
        }
      : log
  );

  return {
    exerciseId,
    store: persistStampedStore({
      ...store,
      logs,
      exerciseLibrary: buildExerciseLibrary(store.templates, logs, [...store.exerciseLibrary, sanitized])
    })
  };
}

export function removeWorkoutExercise(store: LiftStore, workoutId: string, exerciseId: string) {
  const targetWorkout = store.logs.find((log) => log.id === workoutId);

  if (!targetWorkout || targetWorkout.exercises.length <= 1) {
    return store;
  }

  const logs = store.logs.map((log) =>
    log.id === workoutId
      ? {
          ...log,
          exercises: log.exercises.filter((exercise) => exercise.exerciseId !== exerciseId)
        }
      : log
  );

  return persistStampedStore({
    ...store,
    logs,
    exerciseLibrary: buildExerciseLibrary(store.templates, logs, store.exerciseLibrary)
  });
}

function mergeLoggedSets(localSets: LoggedSet[], remoteSets: LoggedSet[]) {
  const byId = new Map<string, LoggedSet>();

  for (const set of [...localSets, ...remoteSets]) {
    const existing = byId.get(set.id);

    if (!existing || set.completedAt > existing.completedAt) {
      byId.set(set.id, set);
    }
  }

  return [...byId.values()].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

function pickPreferredNote(localNote: string, remoteNote: string) {
  if (!localNote) return remoteNote;
  if (!remoteNote) return localNote;
  return remoteNote.length >= localNote.length ? remoteNote : localNote;
}

function mergeWorkoutExercises(local: WorkoutExerciseLog[], remote: WorkoutExerciseLog[]) {
  const byId = new Map<string, WorkoutExerciseLog>();

  for (const exercise of local) {
    byId.set(exercise.exerciseId, exercise);
  }

  for (const exercise of remote) {
    const existing = byId.get(exercise.exerciseId);

    if (!existing) {
      byId.set(exercise.exerciseId, exercise);
      continue;
    }

    byId.set(exercise.exerciseId, {
      exerciseId: existing.exerciseId,
      exerciseName: exercise.exerciseName || existing.exerciseName,
      note: pickPreferredNote(existing.note, exercise.note),
      sets: mergeLoggedSets(existing.sets, exercise.sets)
    });
  }

  return [...byId.values()];
}

function mergeWorkoutLogs(local: WorkoutLog[], remote: WorkoutLog[]) {
  const byId = new Map<string, WorkoutLog>();

  for (const log of local) {
    byId.set(log.id, log);
  }

  for (const log of remote) {
    const existing = byId.get(log.id);

    if (!existing) {
      byId.set(log.id, log);
      continue;
    }

    byId.set(log.id, {
      ...existing,
      templateName: log.templateName || existing.templateName,
      startedAt: existing.startedAt < log.startedAt ? existing.startedAt : log.startedAt,
      completedAt: [existing.completedAt, log.completedAt].filter(Boolean).sort().at(-1) ?? null,
      exercises: mergeWorkoutExercises(existing.exercises, log.exercises)
    });
  }

  return [...byId.values()].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

function mergeTemplates(local: WorkoutTemplate[], remote: WorkoutTemplate[]) {
  const byId = new Map<string, WorkoutTemplate>();

  for (const template of [...local, ...remote]) {
    const existing = byId.get(template.id);

    if (!existing || template.updatedAt > existing.updatedAt) {
      byId.set(template.id, template);
    }
  }

  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function mergeLiftStores(local: LiftStore, remote: LiftStore) {
  const templates = mergeTemplates(local.templates, remote.templates);
  const logs = mergeWorkoutLogs(local.logs, remote.logs);
  const updatedAt = [local.updatedAt, remote.updatedAt].sort().at(-1) ?? new Date().toISOString();

  return replaceLiftStore({
    version: 6,
    updatedAt,
    exerciseLibrary: buildExerciseLibrary(templates, logs, [...local.exerciseLibrary, ...remote.exerciseLibrary]),
    templates,
    logs
  });
}

export function getActiveWorkout(store: LiftStore, date: string) {
  const incomplete = [...store.logs]
    .filter((log) => log.date === date && log.completedAt === null)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return incomplete[0] ?? null;
}

export function getWorkoutCompletion(workout: WorkoutLog) {
  const totalExercises = workout.exercises.length;
  const completedExercises = workout.exercises.filter((exercise) => exercise.sets.length > 0).length;

  return {
    completedExercises,
    totalExercises,
    percent: totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100)
  };
}

function normalizeExerciseKey(name: string) {
  return sanitizeExerciseName(name).toLowerCase();
}

export function getPreviousExerciseReference(
  store: LiftStore,
  exerciseName: string,
  currentWorkoutId?: string
): PreviousExerciseReference | null {
  const key = normalizeExerciseKey(exerciseName);
  const orderedLogs = [...store.logs].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  for (const log of orderedLogs) {
    if (log.id === currentWorkoutId) {
      continue;
    }

    const exercise = log.exercises.find((entry) => normalizeExerciseKey(entry.exerciseName) === key);
    const latestSet = exercise?.sets.at(-1);

    if (latestSet) {
      return {
        date: log.date,
        templateName: log.templateName,
        latestSet,
        note: exercise?.note ?? ""
      };
    }
  }

  return null;
}

function pickBestSet(sets: LoggedSet[]) {
  if (sets.length === 0) {
    return null;
  }

  return [...sets].sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }

    return b.reps - a.reps;
  })[0];
}

export function getExerciseHistory(store: LiftStore, exerciseName: string, limit = 6): ExerciseHistoryItem[] {
  const key = normalizeExerciseKey(exerciseName);

  return [...store.logs]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .flatMap((log) => {
      const exercise = log.exercises.find((entry) => normalizeExerciseKey(entry.exerciseName) === key);

      if (!exercise || exercise.sets.length === 0) {
        return [];
      }

      return [
        {
          workoutId: log.id,
          date: log.date,
          templateName: log.templateName,
          bestSet: pickBestSet(exercise.sets),
          latestSet: exercise.sets.at(-1) ?? null,
          setCount: exercise.sets.length,
          note: exercise.note
        }
      ];
    })
    .slice(0, limit);
}
