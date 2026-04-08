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
    <html lang="en">
      <body className="bg-navy text-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
