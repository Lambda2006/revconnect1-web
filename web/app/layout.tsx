import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: {
    default: "VictoryRevConnect Boaters — Know Your Boat. Own the Water.",
    template: "%s | VictoryRevConnect Boaters",
  },
  description:
    "Your AI boat mechanic. Answer a few guided questions to pinpoint the problem, follow step-by-step repairs for your exact make and model, keep an offline knowledge base for maintenance and specs, and meet other boaters near you.",
  keywords: ["marine mechanic AI", "boat diagnostics", "boat maintenance app", "boating app", "boat knowledge base", "boat meetups"],
  openGraph: {
    title: "VictoryRevConnect Boaters — Know Your Boat. Own the Water.",
    description: "Your AI boat mechanic — diagnose problems, follow step-by-step repairs for your exact boat, and meet other boaters near you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A2240" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/app-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <NavbarWrapper>{children}</NavbarWrapper>
      </body>
    </html>
  );
}
