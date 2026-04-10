import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lift Log",
    template: "%s | Lift Log"
  },
  description:
    "Lift Log is a minimal workout logging app built for fast daily use during workouts, with templates, previous-set autofill, and simple progression history.",
  applicationName: "Lift Log",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lift Log"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: "/apple-icon"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ff3c00"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-[var(--font-sans)] text-foreground">
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
