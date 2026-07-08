import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Women's Wellness Check-In",
  description: "A gentle check-in for women 40+ to share wellness concerns with Evelyn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
