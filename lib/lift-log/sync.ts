import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { LiftStore } from "@/lib/lift-log/types";

type LiftLogStoreRow = {
  user_id: string;
  store: LiftStore;
  updated_at: string;
};

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

function getBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }

  return browserClient;
}

export function isLiftLogSyncAvailable() {
  return isSupabaseConfigured();
}

export async function getLiftLogSyncUser() {
  const supabase = getBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export function subscribeToLiftLogAuth(callback: (user: User | null) => void) {
  const supabase = getBrowserClient();

  if (!supabase) {
    return () => undefined;
  }

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}

export async function sendLiftLogMagicLink(email: string) {
  const supabase = getBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window === "undefined" ? undefined : window.location.origin
    }
  });

  if (error) {
    throw error;
  }
}

export async function signOutLiftLogSync() {
  const supabase = getBrowserClient();

  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function readLiftLogCloudStore(userId: string) {
  const supabase = getBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("lift_log_stores")
    .select("user_id, store, updated_at")
    .eq("user_id", userId)
    .maybeSingle<LiftLogStoreRow>();

  if (error) {
    throw error;
  }

  return data?.store ?? null;
}

export async function writeLiftLogCloudStore(userId: string, store: LiftStore) {
  const supabase = getBrowserClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("lift_log_stores").upsert(
    {
      user_id: userId,
      store,
      updated_at: store.updatedAt
    },
    {
      onConflict: "user_id"
    }
  );

  if (error) {
    throw error;
  }
}
