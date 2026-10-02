import type { Metadata } from "next";
import "./globals.css";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "SOCIAL PULSE - Find Trends. Analyze Content. Make Smarter Moves.",
  description: "AI-Powered Instagram & TikTok Analytics SaaS - Neo-Brutalism UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk">
      <body className="antialiased">{children}</body>
    </html>
  );
}
