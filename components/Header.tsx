import Link from "next/link";
import Image from "next/image";
import { WalletConnect } from "./WalletConnect";
import { XIcon } from "./XIcon";

const SHELBY_X_URL = "https://x.com/shelbyserves";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-pink-50 hover:text-accent transition-colors">
          <Image src="/shelby-logo.png" alt="Shelby" width={40} height={40} className="h-9 w-9 object-contain" priority />
          <span className="text-lg hidden sm:inline">ShelbyShare</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/"
            className="text-sm text-pink-300/80 hover:text-pink-100 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className="text-sm text-pink-300/80 hover:text-pink-100 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-pink-300/80 hover:text-pink-100 transition-colors"
          >
            Dashboard
          </Link>
          <a
            href={SHELBY_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-pink-500/10"
            title="Shelby Protocol on X (Twitter)"
            aria-label="Shelby Protocol on X"
          >
            <XIcon className="w-5 h-5" />
          </a>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
