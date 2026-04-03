import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShelbyShare — Decentralized File Sharing",
  description:
    "Share files on Shelby Protocol. Upload, get a link, share. Built on Shelby Protocol. Follow @shelbyserves on X.",
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
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans min-h-screen flex flex-col selection:bg-primary/30 selection:text-on-primary">
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
