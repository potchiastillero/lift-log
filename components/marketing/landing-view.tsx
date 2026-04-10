"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, BarChart3, Flame, ShieldCheck, Sparkles, Swords } from "lucide-react";
import { landingSections, marketingStats } from "@/lib/ascend/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const featureCards = [
  {
    icon: Swords,
    title: "Daily mandates",
    description: "Convert your real routine into a curated list of high-value actions with stat-linked rewards."
  },
  {
    icon: BarChart3,
    title: "Signal-rich analytics",
    description: "Track experience growth, completion velocity, and which systems are quietly slipping."
  },
  {
    icon: Award,
    title: "Achievements and tiers",
    description: "Unlock milestones that reinforce consistency, not empty novelty."
  },
  {
    icon: Flame,
    title: "Streak architecture",
    description: "Build momentum with daily and category streaks that reward durable habits."
  }
];

export function LandingView() {
  return (
    <div className="pb-16">
      <header className="app-shell flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 shadow-[0_10px_35px_rgba(110,182,255,0.16)]">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Ascend</div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted">Ascension System</div>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-muted transition hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up">
            <Button>Start Ascending</Button>
          </Link>
        </div>
      </header>

      <main className="app-shell">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-7"
          >
            <Badge>Dark, disciplined, cinematic</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-[5.6rem]">
                Turn your life into a <span className="text-gradient">premium progression system.</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Ascend transforms real-world execution into visible growth. Finish mandates, raise your stats,
                maintain streaks, unlock tiers, and track your evolution with a dashboard built to pull you back into focus.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg">
                  Begin the system
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary">
                  Open live preview
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 pt-3 sm:grid-cols-2 xl:grid-cols-4">
              {marketingStats.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/4 px-4 py-4">
                  <div className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{item.value}</div>
                  <div className="mt-2 text-sm text-muted">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
            className="panel relative overflow-hidden rounded-[36px] p-6 sm:p-7"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />
            <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/18 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent-warm/12 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Live system</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">Operator profile</h2>
                </div>
                <Badge className="bg-accent/12 text-accent">Vanguard Tier</Badge>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted">Level</div>
                    <div className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-foreground">8</div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/15 px-4 py-3 text-right">
                    <div className="text-xs uppercase tracking-[0.28em] text-muted">Momentum</div>
                    <div className="mt-2 text-2xl font-semibold text-success">78%</div>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Experience progress</span>
                    <span>310 / 678</span>
                  </div>
                  <Progress value={46} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Daily completion</span>
                    <span>3 / 6</span>
                  </div>
                  <Progress className="mt-4" value={50} indicatorClassName="bg-[linear-gradient(90deg,#7ee2ba_0%,#2bb58f_100%)]" />
                  <p className="mt-4 text-sm leading-7 text-muted">Your system is stable. One more clean session pushes the curve higher.</p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <ShieldCheck className="h-4 w-4 text-accent-warm" />
                    Current focus
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Strength Block", "Learning Sprint", "Finance Checkpoint"].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3 text-sm text-muted-strong">
                        <span>{item}</span>
                        <span className="text-accent">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 py-12 lg:grid-cols-4">
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full border-white/8 bg-white/4">
                <CardContent className="space-y-4 pt-6">
                  <feature.icon className="h-8 w-8 text-accent" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-[-0.03em]">{feature.title}</h3>
                    <p className="text-sm leading-7 text-muted">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <Badge>What Ascend does</Badge>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-foreground sm:text-5xl">
              Structure your growth with the same care you give your work.
            </h2>
            <p className="max-w-xl text-base leading-8 text-muted">
              The system is grounded in reality: complete tasks, gain experience, build streaks, improve stats, unlock tier titles, and keep the signal clear.
            </p>
          </div>

          <div className="grid gap-4">
            {landingSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="panel-soft rounded-[28px] p-6"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-accent">{section.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">{section.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{section.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="panel overflow-hidden rounded-[36px] px-6 py-7 sm:px-8 sm:py-9">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <Badge>Ready when you are</Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Build a system that makes progress visible.</h2>
                <p className="max-w-2xl text-sm leading-7 text-muted">
                  Start with beginner mandates, track real momentum, and let Ascend turn scattered effort into clean progression.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg">Create account</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
