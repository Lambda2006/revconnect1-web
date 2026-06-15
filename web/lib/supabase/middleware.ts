// Re-exported here so the root middleware.ts has a clean import path.
// The actual session-refresh logic lives in /middleware.ts.
export { createServerClient } from "@supabase/ssr";
