export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell grid min-h-screen items-center gap-8 py-10 lg:grid-cols-[1fr_520px]">
      <div className="hidden lg:block">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs uppercase tracking-[0.34em] text-accent">Ascension System</p>
          <h1 className="text-6xl font-semibold leading-[0.92] tracking-[-0.06em] text-foreground">
            Build a sharper life through visible progression.
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted">
            Sign in to access your protected dashboard, or create an account and seed your profile with focused starter quests, achievements, and tier progression.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
