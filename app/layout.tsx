import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synergy Sales Training Engine",
  description:
    "Bilingual B2B sales training simulator for Synergy Lubricant & Chemical Co., Ltd.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>{children}</body>
    </html>
  );
}
