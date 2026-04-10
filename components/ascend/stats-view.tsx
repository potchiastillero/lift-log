"use client";

import { statAccent } from "@/lib/ascend/config";
import { useAscendStore } from "@/lib/ascend/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function StatsView() {
  const stats = useAscendStore((state) => state.stats);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.key} className="overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${statAccent[stat.key]}`} />
          <CardHeader>
            <Badge>{stat.label}</Badge>
            <CardTitle className="mt-3 text-3xl tracking-[-0.05em]">{stat.value}</CardTitle>
            <CardDescription>{stat.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-muted">
                <span>Mastery progress</span>
                <span>{stat.value}%</span>
              </div>
              <Progress value={stat.value} indicatorClassName={`bg-gradient-to-r ${statAccent[stat.key]}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted">XP bank</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{stat.experience}</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted">Trend</div>
                <div className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${stat.trend >= 0 ? "text-success" : "text-danger"}`}>
                  {stat.trend >= 0 ? "+" : ""}
                  {stat.trend}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
