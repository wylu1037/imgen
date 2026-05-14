import type { Metadata } from "next"

import { AmbientBackground } from "./_components/ambient-background"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Image Workspace",
  description: "Generate images through a configurable OpenAI image API workspace.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
