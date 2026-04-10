"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Medal, Settings, Sparkles, Swords, Trophy, UserCircle2 } from "lucide-react";
import { appNavigation } from "@/lib/ascend/config";
import { useAscendStore } from "@/lib/ascend/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const navIcons = {
  "/dashboard": UserCircle2,
  "/quests": Swords,
  "/stats": BarChart3,
  "/achievements": Trophy,
  "/progress": Medal,
  "/settings": Settings
};

export function AppShell({
  children,
  mode
}: {
  children: React.ReactNode;
  mode: "preview" | "supabase";
}) {
  const pathname = usePathname();
  const profile = useAscendStore((state) => state.profile);

  return (
    <div className="app-shell grid gap-5 py-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-6">
      <aside className="panel-soft rounded-[32px] p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 shadow-[0_10px_35px_rgba(110,182,255,0.14)]">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">Ascend</div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted">Ascension System</div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-foreground">{profile.displayName}</div>
              <div className="mt-1 text-sm text-muted">{profile.title}</div>
            </div>
            <Badge className="bg-accent/12 text-accent">{profile.tier}</Badge>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Level</div>
              <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-foreground">{profile.level}</div>
            </div>
            <div className="text-right text-sm text-muted">
              <div>Momentum</div>
              <div className="mt-2 font-semibold text-success">{profile.momentum}%</div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Experience</span>
              <span>
                {profile.currentExperience} / {profile.nextLevelExperience}
              </span>
            </div>
            <Progress value={(profile.currentExperience / profile.nextLevelExperience) * 100} />
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {appNavigation.map((item) => {
            const Icon = navIcons[item.href as keyof typeof navIcons];
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(131,195,255,0.2),rgba(46,134,255,0.18))] text-foreground"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {active ? <div className="h-2 w-2 rounded-full bg-accent" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-[26px] border border-white/10 bg-black/15 p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-muted">Mode</div>
            <div className="mt-2 text-base font-semibold text-foreground">
              {mode === "preview" ? "Preview data" : "Supabase session"}
            </div>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "preview"
                ? "You can explore the full product locally before connecting Supabase."
                : "Your authenticated session is active and protected routes are enforced."}
            </p>
            {mode === "preview" ? (
              <Link href="/sign-up">
                <Button variant="secondary" className="mt-4 w-full">
                  Enable auth
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="panel-soft flex flex-col justify-between gap-4 rounded-[32px] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted">Command state</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              The system rewards finished action.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile.focusAreas.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
