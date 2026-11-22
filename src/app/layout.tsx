import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneAtlas — AI model intelligence",
  description: "Discover, compare, and evaluate foundation models from leading AI providers.",
  applicationName: "OneAtlas",
  keywords: ["AI models", "LLM pricing", "model comparison", "benchmarks"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Suspense fallback={<div className="shell-fallback" />}><AppShell>{children}</AppShell></Suspense></body>
    </html>
  );
}
