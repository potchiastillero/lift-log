import { achievementCatalog, landingRecommendations, starterGoals, starterTasks, statsCatalog, tierConfig } from "@/lib/ascend/config";
import type {
  AchievementRecord,
  ActivityRecord,
  AscendState,
  LevelUpPayload,
  Profile,
  RecommendationRecord,
  StatKey,
  StatRecord,
  TaskRecord
} from "@/lib/ascend/types";

export function experienceForLevel(level: number) {
  return Math.floor(180 + level * 95 + Math.pow(level, 1.6) * 18);
}

export function resolveLevel(totalExperience: number) {
  let level = 1;
  let spent = 0;

  while (totalExperience >= spent + experienceForLevel(level)) {
    spent += experienceForLevel(level);
    level += 1;
  }

  const currentExperience = totalExperience - spent;
  const nextLevelExperience = experienceForLevel(level);

  return { level, currentExperience, nextLevelExperience };
}

export function tierForLevel(level: number) {
  return tierConfig.find((tier) => level >= tier.levels[0] && level <= tier.levels[1]) ?? tierConfig[0];
}

export function statGainForTask(task: TaskRecord) {
  const base = {
    initiate: 2,
    steady: 4,
    intense: 6
  }[task.difficulty];

  return Math.max(1, Math.round(base + task.experienceReward / 30));
}

export function createInitialState(): AscendState {
  const totalExperience = 1480;
  const levelState = resolveLevel(totalExperience);
  const tier = tierForLevel(levelState.level);

  const profile: Profile = {
    displayName: "Alex Mercer",
    title: "Systems Builder",
    tier: tier.slug,
    level: levelState.level,
    totalExperience,
    currentExperience: levelState.currentExperience,
    nextLevelExperience: levelState.nextLevelExperience,
    focusAreas: ["Body", "Deep Work", "Finances"],
    momentum: 78,
    joinedAt: "2026-03-01T09:00:00.000Z",
    avatarSeed: "ascend-alex"
  };

  const stats: StatRecord[] = [
    { key: "strength", label: "Strength", value: 64, experience: 420, trend: 8, description: statsCatalog[0].description },
    { key: "discipline", label: "Discipline", value: 58, experience: 390, trend: -2, description: statsCatalog[1].description },
    { key: "knowledge", label: "Knowledge", value: 71, experience: 470, trend: 6, description: statsCatalog[2].description },
    { key: "health", label: "Health", value: 62, experience: 412, trend: 4, description: statsCatalog[3].description },
    { key: "social", label: "Social", value: 46, experience: 288, trend: -4, description: statsCatalog[4].description },
    { key: "wealth", label: "Wealth", value: 53, experience: 336, trend: 5, description: statsCatalog[5].description }
  ];

  return {
    profile,
    stats,
    tasks: starterTasks,
    achievements: achievementCatalog,
    streaks: [
      { key: "daily", label: "Daily streak", current: 6, best: 14 },
      { key: "discipline", label: "Discipline streak", current: 4, best: 11 },
      { key: "health", label: "Health streak", current: 9, best: 15 }
    ],
    activities: [
      { id: "act-1", type: "task", title: "Recovery Anchor completed", detail: "+35 experience, +3 Health", occurredAt: "2026-04-10T06:35:00.000Z" },
      { id: "act-2", type: "task", title: "Morning Calibration completed", detail: "+45 experience, +6 Discipline", occurredAt: "2026-04-10T06:10:00.000Z" },
      { id: "act-3", type: "achievement", title: "Tier Break unlocked", detail: "Reached Vanguard Tier", occurredAt: "2026-04-09T20:15:00.000Z" },
      { id: "act-4", type: "streak", title: "Health streak extended", detail: "9 days active", occurredAt: "2026-04-09T19:20:00.000Z" },
      { id: "act-5", type: "system", title: "New weekly objective surfaced", detail: "Extended Endurance Session is live", occurredAt: "2026-04-08T08:00:00.000Z" }
    ],
    goals: starterGoals,
    tiers: tierConfig,
    progress: [
      { date: "Apr 4", experience: 930, completions: 3 },
      { date: "Apr 5", experience: 1040, completions: 4 },
      { date: "Apr 6", experience: 1130, completions: 4 },
      { date: "Apr 7", experience: 1215, completions: 5 },
      { date: "Apr 8", experience: 1290, completions: 3 },
      { date: "Apr 9", experience: 1375, completions: 5 },
      { date: "Apr 10", experience: 1480, completions: 2 }
    ],
    recommendations: landingRecommendations
  };
}

function unlockAchievementIfNeeded(achievement: AchievementRecord, state: AscendState): AchievementRecord {
  if (achievement.unlocked) {
    return achievement;
  }

  const completedTasks = state.tasks.reduce((sum, task) => sum + task.completions + (task.completed ? 1 : 0), 0);
  const bestStreak = Math.max(...state.streaks.map((streak) => streak.best));
  const maxStat = Math.max(...state.stats.map((stat) => stat.value));
  const allDailyDone = state.tasks.filter((task) => task.recurrence === "daily").every((task) => task.completed);
  const allWeeklyDone = state.tasks.filter((task) => task.recurrence === "weekly").every((task) => task.completed);

  const unlocked =
    (achievement.id === "streak-7" && bestStreak >= 7) ||
    (achievement.id === "streak-30" && bestStreak >= 30) ||
    (achievement.id === "level-10" && state.profile.level >= 10) ||
    (achievement.id === "tasks-100" && completedTasks >= 100) ||
    (achievement.id === "stat-80" && maxStat >= 80) ||
    (achievement.id === "perfect-day" && allDailyDone) ||
    (achievement.id === "perfect-week" && allWeeklyDone);

  return unlocked ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() } : achievement;
}

function flavorText(state: AscendState) {
  const momentum = state.profile.momentum;
  if (momentum >= 85) return "Momentum is compounding. Protect the rhythm and keep your standards high.";
  if (momentum >= 70) return "Your system is stable. One more clean session pushes the curve higher.";
  if (momentum >= 55) return "Execution is alive, but there is drift at the edges. Tighten the next decision.";
  return "Signal is weakening. Finish one meaningful task now and rebuild the day around it.";
}

export function buildMotivationalState(state: AscendState) {
  return {
    headline: flavorText(state),
    weakest: [...state.stats].sort((a, b) => a.value - b.value)[0],
    strongest: [...state.stats].sort((a, b) => b.value - a.value)[0]
  };
}

export function buildRecommendations(state: AscendState): RecommendationRecord[] {
  const weakestStats = [...state.stats].sort((a, b) => a.value - b.value).slice(0, 2);

  return weakestStats.map((stat, index) => ({
    id: `adaptive-${stat.key}-${index}`,
    title: `${stat.label} recovery protocol`,
    description: `Create one focused action that directly raises ${stat.label.toLowerCase()} today.`,
    statKey: stat.key,
    reason: index === 0 ? "Weakest stat" : "Secondary weak point",
    experienceReward: 20 + index * 10
  }));
}

export function completeTask(state: AscendState, taskId: string) {
  const task = state.tasks.find((entry) => entry.id === taskId);
  if (!task || task.completed) {
    return state;
  }

  const now = new Date().toISOString();
  const gain = statGainForTask(task);
  const previousLevel = state.profile.level;
  const totalExperience = state.profile.totalExperience + task.experienceReward;
  const levelState = resolveLevel(totalExperience);
  const tier = tierForLevel(levelState.level);
  const gainedLevel = levelState.level > previousLevel;

  const stats = state.stats.map((stat) =>
    task.statKeys.includes(stat.key)
      ? {
          ...stat,
          value: Math.min(100, stat.value + gain),
          experience: stat.experience + task.experienceReward,
          trend: Math.min(18, stat.trend + 3)
        }
      : stat
  );

  const tasks = state.tasks.map((entry) =>
    entry.id === taskId
      ? {
          ...entry,
          completed: true,
          lastCompletedAt: now,
          completions: entry.completions + 1
        }
      : entry
  );

  const streaks = state.streaks.map((streak) => ({
    ...streak,
    current: streak.current + 1,
    best: Math.max(streak.best, streak.current + 1)
  }));

  const activities: ActivityRecord[] = [
    {
      id: `activity-${Date.now()}`,
      type: "task" as const,
      title: `${task.title} completed`,
      detail: `+${task.experienceReward} experience, +${gain} ${task.statKeys.map((key) => stats.find((stat) => stat.key === key)?.label ?? key).join(" / ")}`,
      occurredAt: now
    },
    ...state.activities
  ].slice(0, 8);

  const nextState: AscendState = {
    ...state,
    profile: {
      ...state.profile,
      tier: tier.slug,
      level: levelState.level,
      totalExperience,
      currentExperience: levelState.currentExperience,
      nextLevelExperience: levelState.nextLevelExperience,
      momentum: Math.min(100, state.profile.momentum + 4)
    },
    stats,
    tasks,
    streaks,
    goals: state.goals.map((goal) =>
      task.statKeys.includes(goal.statKey) ? { ...goal, progress: Math.min(goal.target, goal.progress + 1) } : goal
    ),
    progress: state.progress.map((point, index, arr) =>
      index === arr.length - 1
        ? { ...point, experience: totalExperience, completions: point.completions + 1 }
        : point
    ),
    activities,
    achievements: state.achievements,
    recommendations: state.recommendations
  };

  const achievements = nextState.achievements.map((achievement) => unlockAchievementIfNeeded(achievement, nextState));
  const unlockedThisRun = achievements.find(
    (achievement) =>
      achievement.unlocked &&
      !state.achievements.find((previous) => previous.id === achievement.id)?.unlocked
  );

  const levelUpPayload: LevelUpPayload | undefined = gainedLevel
    ? {
        level: levelState.level,
        tier: tier.label,
        gainedExperience: task.experienceReward
      }
    : undefined;

  const updatedActivities = unlockedThisRun
    ? [
        {
          id: `achievement-${Date.now()}`,
          type: "achievement" as const,
          title: `${unlockedThisRun.name} unlocked`,
          detail: unlockedThisRun.description,
          occurredAt: now
        },
        ...nextState.activities
      ].slice(0, 8)
    : nextState.activities;

  return {
    ...nextState,
    achievements,
    activities: updatedActivities,
    recommendations: buildRecommendations({ ...nextState, achievements, activities: updatedActivities }),
    activeLevelUp: levelUpPayload
  };
}

export function addTask(state: AscendState, task: Omit<TaskRecord, "id" | "completed" | "completions">) {
  const record: TaskRecord = {
    ...task,
    id: `task-${Date.now()}`,
    completed: false,
    completions: 0
  };

  return {
    ...state,
    tasks: [record, ...state.tasks]
  };
}

export function resetLevelUp(state: AscendState) {
  return {
    ...state,
    activeLevelUp: undefined
  };
}

export function statLabel(key: StatKey) {
  return statsCatalog.find((stat) => stat.key === key)?.label ?? key;
}
