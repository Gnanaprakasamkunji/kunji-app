/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import type { Metadata } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.scss";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Kunji — Personal Finance",
  description:
    "Track expenses, income, savings, and investments. Get AI-powered insights to make better financial decisions.",
};

/**
 * RootLayout provides the HTML structure and global styles.
 *
 * @param props - Layout props containing children.
 * @returns The root HTML layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
