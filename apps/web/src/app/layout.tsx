import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Vitacircle — Connecting Ambition with Opportunity",
  description:
    "Media-first portfolios you can tailor to a role, score with AI, share as a live site, and export as PDF or Word. Built for creative job seekers.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Vitacircle — Connecting Ambition with Opportunity",
    description:
      "The operating system for creative job seekers. Build, score, and share portfolios that get you hired.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
