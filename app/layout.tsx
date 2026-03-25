import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Calendar Booking Desk",
  description: "Internal booking tool powered by Google Calendar over MCP."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="calendarium" style={{ ["--grid-bg" as string]: "radial-gradient(circle at 1px 1px, rgba(23, 32, 51, 0.12) 1px, transparent 0)" }}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
