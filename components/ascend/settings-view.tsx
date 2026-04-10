"use client";

import { useState } from "react";
import { Bell, Shield, UserRound } from "lucide-react";
import { useAscendStore } from "@/lib/ascend/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SettingsView() {
  const profile = useAscendStore((state) => state.profile);
  const [name, setName] = useState(profile.displayName);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <Card>
        <CardHeader>
          <Badge>Profile</Badge>
          <CardTitle className="mt-3">Identity settings</CardTitle>
          <CardDescription>Update the way your profile is presented across the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-muted">Display name</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-muted">
            Preview mode keeps settings local in the browser. In Supabase mode, these values should be persisted to the
            `profiles` and `user_settings` tables using the included schema.
          </div>
          <Button variant="secondary">Save locally</Button>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Bell className="h-4 w-4 text-accent" />
              Notifications
            </div>
            <CardTitle className="mt-3">Execution reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-muted">
              Use notifications sparingly. The product works best when it sharpens intention instead of creating more noise.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Shield className="h-4 w-4 text-accent-warm" />
              Security
            </div>
            <CardTitle className="mt-3">Auth state</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-muted">
              When Supabase is configured, the middleware and auth actions in this repo protect routes and maintain session state.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted">
              <UserRound className="h-4 w-4 text-success" />
              System status
            </div>
            <CardTitle className="mt-3">Current profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-muted">
              {profile.displayName} is currently operating inside {profile.tier}. Momentum is {profile.momentum}% with a focus on{" "}
              {profile.focusAreas.join(", ")}.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
