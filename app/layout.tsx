import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ShelbyShare — Decentralized File Sharing",
  description: "Share files on Shelby Protocol. Upload, get a link, share. Built on Shelby Protocol. Follow @shelbyserves on X.",
  openGraph: {
    title: "ShelbyShare — Decentralized File Sharing",
    description: "Share files on Shelby Protocol. Upload, get a link, share.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen text-pink-100/90 selection:bg-accent/25 flex flex-col">
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col">
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
