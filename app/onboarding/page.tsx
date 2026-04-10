import { onboardingFocusAreas } from "@/lib/ascend/config";
import { requireUser } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function OnboardingPage() {
  const context = await requireUser();

  return (
    <div className="app-shell py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <Badge>{context.mode === "preview" ? "Preview onboarding" : "Protected onboarding"}</Badge>
          <CardTitle className="mt-3 text-4xl tracking-[-0.05em]">Configure your starting ascent</CardTitle>
          <CardDescription>
            Choose a display identity, lock your focus areas, and begin with a curated set of mandates and achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Display name</span>
              <Input placeholder="Your operator name" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Primary focus</span>
              <Input placeholder="Body, deep work, finances..." />
            </label>
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Suggested focus areas</div>
            <div className="flex flex-wrap gap-2">
              {onboardingFocusAreas.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-muted">
            The SQL schema in this repository includes onboarding-aware seed data so every new authenticated user can begin with six daily mandates, three weekly objectives, ten starter achievements, tier titles, and example activity history.
          </div>

          <Button>Complete onboarding</Button>
        </CardContent>
      </Card>
    </div>
  );
}
