import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: {
    default: "VictoryRevConnect Boaters — Know Your Boat. Fix It With Confidence.",
    template: "%s | VictoryRevConnect Boaters",
  },
  description:
    "The AI mechanic and knowledge platform for serious boat owners. Diagnose faults, maintain your boat, and get step-by-step guidance built around your specific make and model — plus a community of boaters to connect with.",
  keywords: ["marine mechanic AI", "boat diagnostics", "boat maintenance app", "boating app", "boat knowledge base", "boat meetups"],
  openGraph: {
    title: "VictoryRevConnect Boaters",
    description: "The AI mechanic and knowledge platform for serious boat owners.",
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
