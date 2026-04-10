import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthForm
      title="Enter Ascend"
      description="Use email and password authentication through Supabase. If you have not connected Supabase yet, the app still runs in preview mode so you can explore the full product."
      action={loginAction}
      mode="login"
    />
  );
}
