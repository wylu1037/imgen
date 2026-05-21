import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";

import { AmbientBackground } from "./_components/ambient-background";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteDescription =
  "Generate images through a configurable OpenAI image API workspace.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Imgen — AI Image Workspace",
    template: "%s · Imgen",
  },
  description: siteDescription,
  applicationName: "Imgen",
  openGraph: {
    type: "website",
    siteName: "Imgen",
    title: "Imgen — AI Image Workspace",
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imgen — AI Image Workspace",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={instrumentSerif.variable}
    >
      <body>
        <AmbientBackground />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
