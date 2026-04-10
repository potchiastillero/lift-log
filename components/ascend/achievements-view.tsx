"use client";

import { Lock, Trophy } from "lucide-react";
import { useAscendStore } from "@/lib/ascend/store";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AchievementsView() {
  const achievements = useAscendStore((state) => state.achievements);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className={achievement.unlocked ? "" : "opacity-80"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className={achievement.unlocked ? "bg-accent/12 text-accent" : ""}>
                {achievement.category}
              </Badge>
              {achievement.unlocked ? (
                <Trophy className="h-5 w-5 text-accent-warm" />
              ) : (
                <Lock className="h-5 w-5 text-muted" />
              )}
            </div>
            <CardTitle className="mt-3">{achievement.name}</CardTitle>
            <CardDescription>{achievement.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-muted">
              {achievement.unlocked && achievement.unlockedAt
                ? `Unlocked ${formatRelativeDate(achievement.unlockedAt)}`
                : "Condition not yet met"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
