"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { XIcon } from "./XIcon";

const SHELBY_X_URL = "https://x.com/shelbyserves";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = navActive(pathname, href);
  return (
    <Link
      href={href}
      className={
        active
          ? "border-b-2 border-secondary pb-1 text-sm font-bold tracking-tight text-on-surface"
          : "text-sm font-semibold tracking-tight text-on-surface/60 transition-all duration-200 hover:text-secondary"
      }
    >
      {label}
    </Link>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex min-w-0 items-center gap-6 md:gap-10">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <Image
              src="/shelby-logo.png"
              alt="Shelby"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate text-xl font-extrabold tracking-tight text-secondary md:text-2xl"
            >
              Shelby Share
            </motion.span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <div className="hidden max-w-[220px] min-w-0 items-center rounded-full border border-primary/20 bg-surface-container-high px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-primary/30 lg:flex">
            <Search className="mr-2 h-4 w-4 shrink-0 text-on-surface/40" />
            <input
              className="w-full border-none bg-transparent text-sm text-on-surface placeholder-on-surface/40 focus:outline-none"
              placeholder="Search…"
              type="search"
              aria-label="Search"
            />
          </div>
          <a
            href={SHELBY_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full p-2 text-on-surface/50 transition-colors hover:text-secondary sm:block"
            title="Shelby Protocol on X"
            aria-label="Shelby Protocol on X"
          >
            <XIcon className="h-5 w-5" />
          </a>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
