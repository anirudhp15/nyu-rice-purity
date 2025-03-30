import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYU/NYC Purity Test",
  description: "Find out how pure you are with the NYU/NYC Purity Test!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
