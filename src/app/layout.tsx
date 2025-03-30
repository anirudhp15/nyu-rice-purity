import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYU Purity Test",
  description: "NYU's Purity Test",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: { url: "/favicon.png", type: "image/png" },
    shortcut: { url: "/favicon.png", type: "image/png" },
  },
  manifest: "/site.webmanifest",
  themeColor: "#640000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NYU Purity Test",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel.com; frame-src 'self'"
        />
      </head>
      <body className="px-4 py-8 min-h-screen">
        <div className="mascot-overlay"></div>
        <ErrorBoundary>
          <div className="relative z-10 mx-auto max-w-3xl">{children}</div>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
