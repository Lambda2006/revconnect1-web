"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const APP_PREFIXES = ["/discover", "/my-meetups", "/garage", "/profile"];
const AUTH_PREFIXES = ["/login", "/signup", "/onboarding", "/forgot-password"];
export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAppRoute = APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isHubRoute = pathname === "/hub" || pathname.startsWith("/hub/");
  // The MarineMax demo (/demo) is fully self-contained with its own co-branded
  // navbar — never show the marketing nav/footer over it.
  const isDemoRoute = pathname === "/demo" || pathname.startsWith("/demo/");
  const hideNav = isAppRoute || isAuthRoute || isDemoRoute;

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar hubMode={isHubRoute} />
      <main className="flex-1">{children}</main>
      {!isHubRoute && <Footer />}
    </>
  );
}
