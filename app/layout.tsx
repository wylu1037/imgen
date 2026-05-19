import type { Metadata } from "next"
import { Instrument_Serif } from "next/font/google"
import { Toaster } from "sonner"

import { AmbientBackground } from "./_components/ambient-background"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

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
    <html lang="en" suppressHydrationWarning className={instrumentSerif.variable}>
      <body>
        <AmbientBackground />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
