import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYU Purity Test",
  description: "NYU's Purity Test",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
    other: {
      rel: "icon",
      url: "/images/favicon.ico",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="px-4 py-8 min-h-screen">
        <div className="mascot-overlay"></div>
        <div className="relative z-10 mx-auto max-w-3xl">{children}</div>
      </body>
    </html>
  );
}
