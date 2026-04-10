import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/quests/:path*", "/stats/:path*", "/achievements/:path*", "/progress/:path*", "/settings/:path*", "/onboarding"]
};
