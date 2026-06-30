import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiquorOps AI",
  description: "AI-powered wholesale ordering and automation for beverage distributors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
