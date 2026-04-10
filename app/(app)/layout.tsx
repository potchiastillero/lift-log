import { signOutAction } from "@/app/actions/auth";
import { AppShell } from "@/components/ascend/app-shell";
import { LevelUpModal } from "@/components/ascend/level-up-modal";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/supabase/server";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const context = await requireUser();

  return (
    <div className="min-h-screen">
      <div className="app-shell flex justify-end pt-4">
        <form action={signOutAction}>
          <Button variant="ghost" size="sm" type="submit">
            {context.mode === "preview" ? "Reset session" : "Sign out"}
          </Button>
        </form>
      </div>
      <AppShell mode={context.mode}>{children}</AppShell>
      <LevelUpModal />
    </div>
  );
}
