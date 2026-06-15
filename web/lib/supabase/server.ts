import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies are read-only; ignore
          }
        },
      },
    }
  );
}

// Service-role client for API routes — bypasses RLS
// Lazy singleton: initialized on first property access, not at module load time,
// so Next.js build-time static analysis does not throw "supabaseKey is required".
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type AdminClient = ReturnType<typeof createSupabaseClient>;
let _admin: AdminClient | undefined;
const getAdmin = (): AdminClient => {
  if (!_admin) {
    _admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
};
// Typed as `any` intentionally: the Proxy wrapper breaks Supabase's generic
// type inference, causing `.update()`, `.insert()`, and `.select()` argument
// types to infer as `never`. Using `any` preserves runtime correctness while
// avoiding cascading type errors across all API routes.
export const supabaseAdmin: any = new Proxy({} as AdminClient, {
  get(_, prop: string) {
    return (getAdmin() as any)[prop];
  },
});
