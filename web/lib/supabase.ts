import { createClient } from "@supabase/supabase-js";

// Lazy singleton — same pattern as lib/supabase/server.ts
type AdminClient = ReturnType<typeof createClient>;
let _admin: AdminClient | undefined;
const getAdmin = (): AdminClient => {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
};

// Server-side client (service role) — only used in API routes
// Typed as `any`: Proxy wrapper breaks Supabase generic inference (see lib/supabase/server.ts).
export const supabaseAdmin: any = new Proxy({} as AdminClient, {
  get(_, prop: string) {
    return (getAdmin() as any)[prop];
  },
});
