"use client";

import { useState } from "react";
import { CalendarRange, Plus, ShieldAlert, Swords, Target } from "lucide-react";
import { onboardingFocusAreas, statsCatalog } from "@/lib/ascend/config";
import { useAscendStore } from "@/lib/ascend/store";
import type { Difficulty, Recurrence, StatKey } from "@/lib/ascend/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const difficultyOptions: Difficulty[] = ["initiate", "steady", "intense"];
const recurrenceOptions: Recurrence[] = ["daily", "weekly", "once"];

export function QuestsView() {
  const state = useAscendStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("steady");
  const [recurrence, setRecurrence] = useState<Recurrence>("daily");
  const [experienceReward, setExperienceReward] = useState(45);
  const [selectedStats, setSelectedStats] = useState<StatKey[]>(["discipline"]);
  const [dueDate, setDueDate] = useState("");

  const grouped = {
    daily: state.tasks.filter((task) => task.recurrence === "daily"),
    weekly: state.tasks.filter((task) => task.recurrence === "weekly"),
    once: state.tasks.filter((task) => task.recurrence === "once")
  };

  function toggleStat(statKey: StatKey) {
    setSelectedStats((current) =>
      current.includes(statKey) ? current.filter((item) => item !== statKey) : [...current, statKey]
    );
  }

  function handleCreateTask() {
    if (!title.trim() || selectedStats.length === 0) {
      return;
    }

    state.createTask({
      title: title.trim(),
      description: description.trim() || "Custom user-created objective.",
      difficulty,
      recurrence,
      experienceReward,
      statKeys: selectedStats,
      dueDate: dueDate || undefined,
      penalty: recurrence === "daily" ? 4 : undefined
    });

    setTitle("");
    setDescription("");
    setDifficulty("steady");
    setRecurrence("daily");
    setExperienceReward(45);
    setSelectedStats(["discipline"]);
    setDueDate("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-5">
        {(["daily", "weekly", "once"] as const).map((group) => (
          <Card key={group}>
            <CardHeader>
              <Badge>{group === "daily" ? "Daily mandates" : group === "weekly" ? "Weekly objectives" : "One-time quests"}</Badge>
              <CardTitle className="mt-3 capitalize">{group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {grouped[group].length > 0 ? (
                grouped[group].map((task) => (
                  <div key={task.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium text-foreground">{task.title}</div>
                          <Badge className="bg-white/6 text-muted-strong">{task.difficulty}</Badge>
                          <Badge className="bg-accent/12 text-accent">+{task.experienceReward} XP</Badge>
                        </div>
                        <div className="text-sm leading-7 text-muted">{task.description}</div>
                        <div className="flex flex-wrap gap-2">
                          {task.statKeys.map((statKey) => (
                            <Badge key={statKey}>{statsCatalog.find((stat) => stat.key === statKey)?.label}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex min-w-[220px] flex-col gap-3">
                        <Button variant={task.completed ? "secondary" : "default"} onClick={() => state.completeTask(task.id)}>
                          {task.completed ? "Already complete" : "Mark complete"}
                        </Button>
                        {task.penalty ? (
                          <div className="flex items-center gap-2 rounded-2xl border border-warning/15 bg-warning/8 px-3 py-3 text-xs text-muted">
                            <ShieldAlert className="h-4 w-4 text-warning" />
                            Debt state: -{task.penalty} momentum if ignored
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 p-5 text-sm text-muted">
                  No {group} quests yet. Create one in the command panel.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <Badge>Command panel</Badge>
            <CardTitle className="mt-3">Create a new quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Quest title" />
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does success look like?" />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.24em] text-muted">Difficulty</div>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDifficulty(item)}
                      className={`rounded-2xl px-3 py-3 text-sm capitalize transition ${difficulty === item ? "bg-accent text-slate-950" : "bg-white/5 text-muted hover:text-foreground"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.24em] text-muted">Recurrence</div>
                <div className="grid grid-cols-3 gap-2">
                  {recurrenceOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRecurrence(item)}
                      className={`rounded-2xl px-3 py-3 text-sm capitalize transition ${recurrence === item ? "bg-accent text-slate-950" : "bg-white/5 text-muted hover:text-foreground"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Stat alignment</div>
              <div className="grid grid-cols-2 gap-2">
                {statsCatalog.map((stat) => (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => toggleStat(stat.key)}
                    className={`rounded-2xl px-3 py-3 text-left text-sm transition ${selectedStats.includes(stat.key) ? "bg-[linear-gradient(135deg,rgba(131,195,255,0.2),rgba(46,134,255,0.16))] text-foreground" : "bg-white/5 text-muted hover:text-foreground"}`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.24em] text-muted">XP reward</span>
                <Input
                  type="number"
                  min={10}
                  max={300}
                  value={experienceReward}
                  onChange={(event) => setExperienceReward(Number(event.target.value))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.24em] text-muted">Due date</span>
                <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </label>
            </div>

            <Button onClick={handleCreateTask} className="w-full">
              <Plus className="h-4 w-4" />
              Create quest
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>Suggestions</Badge>
            <CardTitle className="mt-3">Recommended next actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Target className="h-4 w-4" />
                  {recommendation.reason}
                </div>
                <div className="mt-3 font-medium text-foreground">{recommendation.title}</div>
                <p className="mt-2 text-sm leading-7 text-muted">{recommendation.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <CalendarRange className="h-4 w-4 text-accent-warm" />
                  Recommended reward: +{recommendation.experienceReward} experience
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>Starter focus</Badge>
            <CardTitle className="mt-3">Popular onboarding tracks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {onboardingFocusAreas.map((item) => (
              <Badge key={item}>
                <Swords className="mr-1 h-3 w-3" />
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
