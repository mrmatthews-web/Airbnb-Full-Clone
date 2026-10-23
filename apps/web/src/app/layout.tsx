import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Eat In — Good food. Your place.",
  description:
    "Find a local home cook and make a night of staying in. Eat In private prototype.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
