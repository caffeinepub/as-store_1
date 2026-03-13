import { Store } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="navbar-bg border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-600 text-navbar-foreground">
              AS Store
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-navbar-foreground/50">
            <span>Pod Kits &amp; Devices</span>
            <span className="hidden md:inline">·</span>
            <span>Premium Quality</span>
            <span className="hidden md:inline">·</span>
            <span>Fast Shipping</span>
          </div>

          <p className="text-xs text-navbar-foreground/40">
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-navbar-foreground/70 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
