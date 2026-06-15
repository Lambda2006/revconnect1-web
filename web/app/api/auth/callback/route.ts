import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'signup' | 'recovery' | null (OAuth)
  const next = searchParams.get("next") ?? "/discover";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password recovery — send to a reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/forgot-password/reset`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
