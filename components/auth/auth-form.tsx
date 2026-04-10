"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import type { AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  title: string;
  description: string;
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  mode: "login" | "signup";
}

const initialState: AuthActionState = {};

export function AuthForm({ title, description, action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="panel-soft rounded-[32px] p-6 sm:p-8">
      <div className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.34em] text-accent">Ascension System</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">{title}</h1>
        <p className="max-w-md text-sm leading-7 text-muted">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "signup" ? <Input name="displayName" placeholder="Display name" required /> : null}
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required minLength={8} />

        {state.error ? (
          <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-100">
            {state.success}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {mode === "login" ? "Enter Ascend" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
        <span>{mode === "login" ? "Need an account?" : "Already registered?"}</span>
        <Link
          href={mode === "login" ? "/sign-up" : "/login"}
          className="font-semibold text-accent transition hover:text-white"
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}
