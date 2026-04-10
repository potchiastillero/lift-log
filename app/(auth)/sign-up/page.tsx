import { signUpAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <AuthForm
      title="Create your operator profile"
      description="Set up Ascend with your display name, then continue into onboarding to choose focus areas, goals, and starter mandates."
      action={signUpAction}
      mode="signup"
    />
  );
}
