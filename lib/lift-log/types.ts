export type TemplateExercise = {
  id: string;
  name: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
};

export type LoggedSet = {
  id: string;
  weight: number;
  reps: number;
  completedAt: string;
};

export type WorkoutExerciseLog = {
  exerciseId: string;
  exerciseName: string;
  note: string;
  sets: LoggedSet[];
};

export type WorkoutLog = {
  id: string;
  date: string;
  templateId: string;
  templateName: string;
  startedAt: string;
  completedAt: string | null;
  exercises: WorkoutExerciseLog[];
};

export type LiftStore = {
  version: 5;
  exerciseLibrary: string[];
  templates: WorkoutTemplate[];
  logs: WorkoutLog[];
};

export type ExerciseHistoryItem = {
  workoutId: string;
  date: string;
  templateName: string;
  bestSet: LoggedSet | null;
  latestSet: LoggedSet | null;
  setCount: number;
  note: string;
};

export type PreviousExerciseReference = {
  date: string;
  templateName: string;
  latestSet: LoggedSet;
  note: string;
};
