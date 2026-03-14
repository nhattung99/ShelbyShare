import Link from "next/link";
import { WalletConnect } from "./WalletConnect";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-zinc-100 hover:text-accent transition-colors text-lg">
          ShelbyShare
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Dashboard
          </Link>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
