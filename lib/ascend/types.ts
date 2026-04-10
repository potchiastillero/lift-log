export type StatKey = "strength" | "discipline" | "knowledge" | "health" | "social" | "wealth";
export type Recurrence = "daily" | "weekly" | "once";
export type Difficulty = "initiate" | "steady" | "intense";
export type TierSlug = "ember" | "vanguard" | "aether" | "sovereign" | "paragon";
export type AchievementCategory =
  | "completion"
  | "streak"
  | "level"
  | "mastery"
  | "consistency"
  | "focus";

export interface Profile {
  displayName: string;
  title: string;
  tier: TierSlug;
  level: number;
  totalExperience: number;
  currentExperience: number;
  nextLevelExperience: number;
  focusAreas: string[];
  momentum: number;
  joinedAt: string;
  avatarSeed: string;
}

export interface StatRecord {
  key: StatKey;
  label: string;
  value: number;
  experience: number;
  trend: number;
  description: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  recurrence: Recurrence;
  difficulty: Difficulty;
  experienceReward: number;
  statKeys: StatKey[];
  dueDate?: string;
  completed: boolean;
  penalty?: number;
  completions: number;
  lastCompletedAt?: string;
}

export interface AchievementRecord {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StreakRecord {
  key: string;
  label: string;
  current: number;
  best: number;
}

export interface ActivityRecord {
  id: string;
  type: "task" | "achievement" | "level" | "streak" | "system";
  title: string;
  detail: string;
  occurredAt: string;
}

export interface GoalRecord {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  statKey: StatKey;
}

export interface TierRecord {
  slug: TierSlug;
  label: string;
  levels: [number, number];
  summary: string;
}

export interface ProgressPoint {
  date: string;
  experience: number;
  completions: number;
}

export interface RecommendationRecord {
  id: string;
  title: string;
  description: string;
  statKey: StatKey;
  reason: string;
  experienceReward: number;
}

export interface LevelUpPayload {
  level: number;
  tier: string;
  gainedExperience: number;
}

export interface AscendState {
  profile: Profile;
  stats: StatRecord[];
  tasks: TaskRecord[];
  achievements: AchievementRecord[];
  streaks: StreakRecord[];
  activities: ActivityRecord[];
  goals: GoalRecord[];
  tiers: TierRecord[];
  progress: ProgressPoint[];
  recommendations: RecommendationRecord[];
  activeLevelUp?: LevelUpPayload;
}
