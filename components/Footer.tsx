import { XIcon } from "./XIcon";

const SHELBY_X_URL = "https://x.com/shelbyserves";
const SHELBY_DOCS_URL = "https://docs.shelby.xyz";
const SHELBY_WEBSITE_URL = "https://shelby.xyz";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-pink-400/80">
            Powered by{" "}
            <a
              href={SHELBY_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              Shelby Protocol
            </a>
          </p>
          <div className="flex items-center gap-6">
            <a
              href={SHELBY_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-400/80 hover:text-pink-100 transition-colors"
            >
              Docs
            </a>
            <a
              href={SHELBY_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-pink-400/80 hover:text-pink-100 transition-colors"
              title="Follow Shelby on X"
            >
              <XIcon className="w-4 h-4" />
              <span>@shelbyserves</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
