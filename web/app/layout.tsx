import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: {
    default: "VictoryRevConnect Boaters — Connect & Diagnose on the Water",
    template: "%s | VictoryRevConnect Boaters",
  },
  description:
    "The app for serious boaters. Discover meetups, connect with your boating community, and get AI-powered mechanic guidance for your specific boat.",
  keywords: ["boating app", "boat meetups", "marine mechanic AI", "boating community"],
  openGraph: {
    title: "VictoryRevConnect Boaters",
    description: "Discover meetups and get AI mechanic guidance for your boat.",
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
