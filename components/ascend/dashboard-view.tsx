"use client";

import { Activity, ArrowUpRight, Flame, Gem, Sparkles, Target, Trophy } from "lucide-react";
import { buildMotivationalState } from "@/lib/ascend/mechanics";
import { useAscendStore } from "@/lib/ascend/store";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CompletionChart, ExperienceChart } from "@/components/ascend/charts";

export function DashboardView() {
  const state = useAscendStore();
  const motivational = buildMotivationalState(state);
  const dailyTasks = state.tasks.filter((task) => task.recurrence === "daily");
  const weeklyTasks = state.tasks.filter((task) => task.recurrence === "weekly");
  const unlockedAchievements = state.achievements.filter((achievement) => achievement.unlocked).slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden">
          <CardHeader className="relative pb-4">
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-accent/14 blur-3xl" />
            <Badge>Profile</Badge>
            <CardTitle className="mt-3 text-3xl tracking-[-0.05em]">Current ascent</CardTitle>
            <CardDescription>
              {motivational.headline}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-muted">Experience</div>
                    <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-foreground">
                      {state.profile.totalExperience}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.24em] text-muted">Tier</div>
                    <div className="mt-2 text-lg font-semibold text-accent">{state.tiers.find((tier) => tier.slug === state.profile.tier)?.label}</div>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Level progress</span>
                    <span>
                      {state.profile.currentExperience} / {state.profile.nextLevelExperience}
                    </span>
                  </div>
                  <Progress value={(state.profile.currentExperience / state.profile.nextLevelExperience) * 100} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {state.streaks.map((streak) => (
                  <div key={streak.key} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Flame className="h-4 w-4 text-accent-warm" />
                      {streak.label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">{streak.current}</div>
                    <div className="mt-1 text-sm text-muted">Best {streak.best}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Target className="h-4 w-4 text-accent" />
                Adaptive signal
              </div>
              <div className="mt-4 text-sm leading-7 text-muted">
                Weakest stat: <span className="font-semibold text-foreground">{motivational.weakest.label}</span>
              </div>
              <div className="mt-3 text-sm leading-7 text-muted">
                Strongest stat: <span className="font-semibold text-foreground">{motivational.strongest.label}</span>
              </div>
              <div className="mt-5 space-y-3">
                {state.recommendations.slice(0, 2).map((recommendation) => (
                  <div key={recommendation.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold text-foreground">{recommendation.title}</div>
                    <p className="mt-2 text-sm leading-7 text-muted">{recommendation.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <Badge>Today</Badge>
              <CardTitle className="mt-3">Daily mandates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                  <div>
                    <div className="font-medium text-foreground">{task.title}</div>
                    <div className="mt-1 text-sm text-muted">+{task.experienceReward} experience</div>
                  </div>
                  <Button variant={task.completed ? "secondary" : "default"} onClick={() => state.completeTask(task.id)}>
                    {task.completed ? "Complete" : "Finish"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Highlights</Badge>
              <CardTitle className="mt-3">Unlocked achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12">
                      <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{achievement.name}</div>
                      <div className="text-sm text-muted">{achievement.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {state.stats.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted">{stat.label}</div>
                  <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-foreground">{stat.value}</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${stat.trend >= 0 ? "bg-success/12 text-success" : "bg-danger/12 text-danger"}`}>
                  {stat.trend >= 0 ? "+" : ""}
                  {stat.trend}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <Badge>Trend</Badge>
            <CardTitle className="mt-3">Experience over time</CardTitle>
          </CardHeader>
          <CardContent>
            <ExperienceChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge>Output</Badge>
            <CardTitle className="mt-3">Completion velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionChart />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <Badge>Weekly</Badge>
            <CardTitle className="mt-3">Objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyTasks.map((task) => (
              <div key={task.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{task.title}</div>
                    <div className="mt-1 text-sm text-muted">{task.description}</div>
                  </div>
                  <Button variant={task.completed ? "secondary" : "default"} onClick={() => state.completeTask(task.id)}>
                    {task.completed ? "Complete" : "Finish"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>Activity</Badge>
            <CardTitle className="mt-3">Recent log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                  {activity.type === "achievement" ? (
                    <Trophy className="h-4 w-4 text-accent-warm" />
                  ) : activity.type === "streak" ? (
                    <Flame className="h-4 w-4 text-accent" />
                  ) : activity.type === "system" ? (
                    <Sparkles className="h-4 w-4 text-accent" />
                  ) : activity.type === "level" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <Activity className="h-4 w-4 text-muted-strong" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{activity.title}</div>
                  <div className="mt-1 text-sm text-muted">{activity.detail}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                    {formatRelativeDate(activity.occurredAt)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <Badge>Goals</Badge>
            <CardTitle className="mt-3">Long-horizon objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.goals.map((goal) => (
              <div key={goal.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{goal.title}</div>
                    <div className="mt-1 text-sm text-muted">{goal.description}</div>
                  </div>
                  <div className="text-sm font-semibold text-accent">
                    {goal.progress}/{goal.target}
                  </div>
                </div>
                <Progress className="mt-4" value={(goal.progress / goal.target) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>System signal</Badge>
            <CardTitle className="mt-3">Current command state</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Gem className="h-4 w-4 text-accent-warm" />
                Tier summary
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                {state.tiers.find((tier) => tier.slug === state.profile.tier)?.summary}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Sparkles className="h-4 w-4 text-accent" />
                Next push
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Complete one {motivational.weakest.label.toLowerCase()}-linked action today to rebalance your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
