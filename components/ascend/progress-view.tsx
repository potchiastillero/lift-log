"use client";

import { CompletionChart, ExperienceChart } from "@/components/ascend/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgressView() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <Badge>Experience</Badge>
          <CardTitle className="mt-3">Progress curve</CardTitle>
          <CardDescription>Track how your total experience rises with completed work.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExperienceChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge>Completion</Badge>
          <CardTitle className="mt-3">Execution tempo</CardTitle>
          <CardDescription>Measure how many mandates and objectives you actually finish each day.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompletionChart />
        </CardContent>
      </Card>
    </div>
  );
}
