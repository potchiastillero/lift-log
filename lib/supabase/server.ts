import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    }
  );
}

export async function getAuthContext() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      mode: "preview" as const,
      user: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    mode: "supabase" as const,
    user
  };
}

export async function requireUser() {
  const context = await getAuthContext();
  if (context.mode === "preview") {
    return context;
  }

  if (!context.user) {
    redirect("/login");
  }

  return context;
}
