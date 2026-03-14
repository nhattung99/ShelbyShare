import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ShelbyShare — Decentralized File Sharing",
  description: "Share files on Shelby Protocol. Upload, get a link, share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-surface text-zinc-200 selection:bg-accent/20">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
