import Link from "next/link";
import { XIcon } from "./XIcon";

const SHELBY_X_URL = "https://x.com/shelbyserves";
const SHELBY_DOCS_URL = "https://docs.shelby.xyz";
const SHELBY_WEBSITE_URL = "https://shelby.xyz";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-primary/10 bg-surface-container/60">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
          <div>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-secondary">
              Shelby Share
            </h2>
            <p className="max-w-xs text-base font-medium text-on-surface/60">
              Cozy decentralized file sharing on Shelby Protocol — soft UI,
              real on-chain storage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 md:grid-cols-3 md:gap-16">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Product
              </span>
              <Link
                href="/"
                className="text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className="text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                Dashboard
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Shelby
              </span>
              <a
                href={SHELBY_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                Website
              </a>
              <a
                href={SHELBY_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                Docs
              </a>
              <a
                href={SHELBY_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface/70 transition-colors hover:text-secondary"
              >
                <XIcon className="h-4 w-4" />
                @shelbyserves
              </a>
            </div>
            <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Status
              </span>
              <span className="text-sm font-semibold text-on-surface/50">
                Powered by Shelby Protocol
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface/40 md:flex-row">
          <span>© {new Date().getFullYear()} Shelby Share</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Shelby network ready
          </span>
        </div>
      </div>
    </footer>
  );
}
