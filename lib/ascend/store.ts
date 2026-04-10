"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addTask, completeTask, createInitialState, resetLevelUp } from "@/lib/ascend/mechanics";
import type { AscendState, Difficulty, Recurrence, StatKey } from "@/lib/ascend/types";

interface AscendStore extends AscendState {
  completeTask: (taskId: string) => void;
  dismissLevelUp: () => void;
  createTask: (task: {
    title: string;
    description: string;
    recurrence: Recurrence;
    difficulty: Difficulty;
    experienceReward: number;
    statKeys: StatKey[];
    dueDate?: string;
    penalty?: number;
  }) => void;
}

export const useAscendStore = create<AscendStore>()(
  persist(
    (set) => ({
      ...createInitialState(),
      completeTask: (taskId) => set((state) => completeTask(state, taskId)),
      dismissLevelUp: () => set((state) => resetLevelUp(state)),
      createTask: (task) => set((state) => addTask(state, task))
    }),
    {
      name: "ascend-preview"
    }
  )
);
