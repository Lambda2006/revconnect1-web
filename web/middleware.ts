import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  // ── MarineMax partnership demo host ────────────────────────────────────────
  // When served from the demo subdomain (e.g. demo.victoryrevconnect.com), map
  // the host root to the self-contained /demo route tree. This is host-scoped,
  // so the primary app domain is completely unaffected.
  const host = request.headers.get("host") || "";
  const demoHost = process.env.NEXT_PUBLIC_DEMO_HOST || "demo.victoryrevconnect.com";
  if (host === demoHost || host.startsWith("demo.")) {
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith("/demo")) {
      const url = request.nextUrl.clone();
      url.pathname = `/demo${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next({ request });
  }

  // If env vars are missing (e.g. misconfigured deployment), pass through rather than crashing every route.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - must await before checking user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes: anything under /(app) route group paths
  // /blog added in Phase 9 (Session B) - auth-required consumer blog
  const appRoutes = [
    "/discover",
    "/my-meetups",
    "/garage",
    "/profile",
    "/blog",
  ];

  const isAppRoute = appRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAppRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // /business gate — the entire /business section (marketing + marina portal)
  // requires an admin-granted "business access" flag, admin status, or
  // ownership of a verified business. Controlled from the hub accounts page.
  const isBusinessRoute =
    pathname === "/business" || pathname.startsWith("/business/");

  if (isBusinessRoute) {
    // Not signed in -> send to login
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Signed in -> check the grant with the service role (bypasses RLS).
    // Fail-closed only when we can actually evaluate access; if the service
    // key is missing we let the page's own gate handle it.
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const accessClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );

      const [{ data: profile }, { data: adminRow }, { data: ownedBiz }] = await Promise.all([
        accessClient.from("users").select("business_access").eq("id", user.id).maybeSingle(),
        accessClient.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
        accessClient.from("businesses").select("id").eq("owner_user_id", user.id).eq("is_verified", true).limit(1),
      ]);

      const allowed =
        !!adminRow ||
        profile?.business_access === true ||
        ((ownedBiz?.length ?? 0) > 0);

      if (!allowed) {
        const discoverUrl = request.nextUrl.clone();
        discoverUrl.pathname = "/discover";
        return NextResponse.redirect(discoverUrl);
      }
    }
  }

  // Redirect authenticated users away from auth pages to /discover
  const authRoutes = ["/login", "/signup"];
  if (authRoutes.includes(pathname) && user) {
    const discoverUrl = request.nextUrl.clone();
    discoverUrl.pathname = "/discover";
    return NextResponse.redirect(discoverUrl);
  }

  // Management Hub gate - Phase 9 (Session A)
  // Matches /hub/** (page routes) and /api/hub/** (API routes).
  // Not linked anywhere in the consumer UI - access is by direct URL only.
  const isHubRoute =
    pathname === "/hub" ||
    pathname.startsWith("/hub/") ||
    pathname === "/api/hub" ||
    pathname.startsWith("/api/hub/");

  if (isHubRoute) {
    // No session -> redirect to /login
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Session exists - check admin_users with service role to bypass RLS
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );

      const { data } = await adminClient
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        // No admin row -> 404 (don't reveal the route exists) + redirect to /discover
        const discoverUrl = request.nextUrl.clone();
        discoverUrl.pathname = "/discover";
        const res = NextResponse.redirect(discoverUrl);
        res.headers.set("x-middleware-status", "404");
        return res;
      }
    }
    // Admin confirmed - fall through to supabaseResponse
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, icons/
     * - api routes handled separately
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|workbox-).*)",
  ],
};
