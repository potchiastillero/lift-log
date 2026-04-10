import type {
  AchievementRecord,
  GoalRecord,
  RecommendationRecord,
  StatKey,
  StatRecord,
  TaskRecord,
  TierRecord
} from "@/lib/ascend/types";

export const statsCatalog: Array<Pick<StatRecord, "key" | "label" | "description">> = [
  { key: "strength", label: "Strength", description: "Physical output, power, and follow-through under friction." },
  { key: "discipline", label: "Discipline", description: "Consistency, execution quality, and command over routine." },
  { key: "knowledge", label: "Knowledge", description: "Learning velocity, reading depth, and skill acquisition." },
  { key: "health", label: "Health", description: "Recovery, sleep, movement, and baseline vitality." },
  { key: "social", label: "Social", description: "Presence, communication, and relationship maintenance." },
  { key: "wealth", label: "Wealth", description: "Financial stewardship, planning, and earning capacity." }
];

export const tierConfig: TierRecord[] = [
  { slug: "ember", label: "Ember Tier", levels: [1, 4], summary: "Early momentum with visible structure and control." },
  { slug: "vanguard", label: "Vanguard Tier", levels: [5, 9], summary: "Execution becomes dependable and measured." },
  { slug: "aether", label: "Aether Tier", levels: [10, 14], summary: "Your system compounds with precision and range." },
  { slug: "sovereign", label: "Sovereign Tier", levels: [15, 19], summary: "High agency, high consistency, low wasted motion." },
  { slug: "paragon", label: "Paragon Tier", levels: [20, 99], summary: "Elite clarity with durable, long-horizon growth." }
];

export const starterTasks: TaskRecord[] = [
  {
    id: "daily-lift",
    title: "Strength Block",
    description: "Complete a focused strength session or bodyweight circuit.",
    recurrence: "daily",
    difficulty: "intense",
    experienceReward: 80,
    statKeys: ["strength", "health"],
    completed: false,
    penalty: 8,
    completions: 18
  },
  {
    id: "daily-plan",
    title: "Morning Calibration",
    description: "Plan the day, lock the top three priorities, and remove one distraction.",
    recurrence: "daily",
    difficulty: "steady",
    experienceReward: 45,
    statKeys: ["discipline"],
    completed: true,
    penalty: 5,
    completions: 29,
    lastCompletedAt: new Date().toISOString()
  },
  {
    id: "daily-read",
    title: "Learning Sprint",
    description: "Read, study, or practice deliberately for at least 30 minutes.",
    recurrence: "daily",
    difficulty: "steady",
    experienceReward: 55,
    statKeys: ["knowledge"],
    completed: false,
    penalty: 4,
    completions: 24
  },
  {
    id: "daily-recover",
    title: "Recovery Anchor",
    description: "Protect sleep, hydration, and one restorative ritual.",
    recurrence: "daily",
    difficulty: "initiate",
    experienceReward: 35,
    statKeys: ["health"],
    completed: true,
    penalty: 4,
    completions: 33,
    lastCompletedAt: new Date().toISOString()
  },
  {
    id: "daily-reachout",
    title: "Social Reach",
    description: "Send one thoughtful message or hold one meaningful conversation.",
    recurrence: "daily",
    difficulty: "initiate",
    experienceReward: 30,
    statKeys: ["social"],
    completed: false,
    penalty: 3,
    completions: 20
  },
  {
    id: "daily-finance",
    title: "Finance Checkpoint",
    description: "Track spending, review accounts, or push one income-building action.",
    recurrence: "daily",
    difficulty: "steady",
    experienceReward: 40,
    statKeys: ["wealth", "discipline"],
    completed: false,
    penalty: 5,
    completions: 16
  },
  {
    id: "weekly-review",
    title: "Weekly Review",
    description: "Review wins, misses, and next-week priorities.",
    recurrence: "weekly",
    difficulty: "steady",
    experienceReward: 100,
    statKeys: ["discipline", "knowledge"],
    completed: false,
    completions: 8
  },
  {
    id: "weekly-longrun",
    title: "Extended Endurance Session",
    description: "Complete one long walk, run, or conditioning block.",
    recurrence: "weekly",
    difficulty: "intense",
    experienceReward: 120,
    statKeys: ["health", "strength"],
    completed: false,
    completions: 6
  },
  {
    id: "weekly-network",
    title: "Relationship Investment",
    description: "Schedule one high-value conversation or social event.",
    recurrence: "weekly",
    difficulty: "steady",
    experienceReward: 85,
    statKeys: ["social", "wealth"],
    completed: true,
    completions: 5,
    lastCompletedAt: new Date().toISOString()
  }
];

export const starterGoals: GoalRecord[] = [
  {
    id: "goal-physique",
    title: "Build a sharper baseline",
    description: "Reach 30 completed physical sessions with consistency.",
    progress: 18,
    target: 30,
    statKey: "strength"
  },
  {
    id: "goal-deepwork",
    title: "Protect focused output",
    description: "Log 60 deliberate planning and deep-work blocks.",
    progress: 29,
    target: 60,
    statKey: "discipline"
  },
  {
    id: "goal-capital",
    title: "Raise financial command",
    description: "Complete 25 meaningful wealth actions this quarter.",
    progress: 11,
    target: 25,
    statKey: "wealth"
  }
];

export const achievementCatalog: AchievementRecord[] = [
  { id: "first-step", category: "completion", name: "First Step", description: "Finish your first mandate.", icon: "Spark", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "streak-3", category: "streak", name: "Three-Day Rhythm", description: "Hold a three-day completion streak.", icon: "Flame", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "streak-7", category: "streak", name: "Seven-Day Tempo", description: "Maintain seven days of steady output.", icon: "Orbit", unlocked: false },
  { id: "streak-30", category: "streak", name: "Iron Routine", description: "Maintain a thirty-day streak.", icon: "Shield", unlocked: false },
  { id: "level-5", category: "level", name: "Tier Break", description: "Reach level five and unlock Vanguard Tier.", icon: "Crown", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "level-10", category: "level", name: "Aether Threshold", description: "Reach level ten.", icon: "Hexagon", unlocked: false },
  { id: "tasks-100", category: "completion", name: "Centurion", description: "Complete one hundred tasks.", icon: "CheckCircle2", unlocked: false },
  { id: "stat-80", category: "mastery", name: "Stat Ascendant", description: "Push any stat to eighty.", icon: "TrendingUp", unlocked: false },
  { id: "perfect-day", category: "consistency", name: "Perfect Day", description: "Finish every daily mandate in a single day.", icon: "Sunrise", unlocked: false },
  { id: "perfect-week", category: "focus", name: "Perfect Week", description: "Complete every weekly objective in one week.", icon: "CalendarRange", unlocked: false }
];

export const landingRecommendations: RecommendationRecord[] = [
  {
    id: "rec-discipline",
    title: "Lock tonight’s shutdown routine",
    description: "Discipline is your lowest active stat. Protect tomorrow by closing today well.",
    statKey: "discipline",
    reason: "Lowest active stat",
    experienceReward: 25
  },
  {
    id: "rec-social",
    title: "Restore one key relationship",
    description: "Social momentum dipped this week. A single thoughtful check-in resets the curve.",
    statKey: "social",
    reason: "Recent inactivity",
    experienceReward: 30
  }
];

export const onboardingFocusAreas = [
  "Body",
  "Deep Work",
  "Learning",
  "Recovery",
  "Relationships",
  "Finances"
];

export const landingSections = [
  {
    eyebrow: "Progression",
    title: "Turn disciplined action into visible advancement.",
    description: "Daily mandates, weekly objectives, stat curves, streaks, and tier progression give your real life a structure worth returning to."
  },
  {
    eyebrow: "Signal",
    title: "See momentum before motivation fades.",
    description: "Ascend surfaces your trend lines, weakest systems, and recent execution so you know where to push next."
  },
  {
    eyebrow: "Retention",
    title: "The interface rewards focus, not noise.",
    description: "Every screen is built to feel serious, sharp, and satisfying without slipping into novelty or parody."
  }
];

export const marketingStats = [
  { label: "Core stats tracked", value: "6" },
  { label: "Starter achievements", value: "10" },
  { label: "Tier checkpoints", value: "Every 5 levels" },
  { label: "Views optimized", value: "Phone to desktop" }
];

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quests", label: "Quests" },
  { href: "/stats", label: "Stats" },
  { href: "/achievements", label: "Achievements" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" }
];

export const statAccent: Record<StatKey, string> = {
  strength: "from-[#8ed1ff] to-[#2e86ff]",
  discipline: "from-[#b5a3ff] to-[#5f56f8]",
  knowledge: "from-[#f4c17d] to-[#d78332]",
  health: "from-[#7ee2ba] to-[#2bb58f]",
  social: "from-[#ff9bb2] to-[#ff6f93]",
  wealth: "from-[#ffe28f] to-[#d4a63f]"
};
