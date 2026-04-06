import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t border-border bg-bg px-6 py-12 lg:px-12"
      role="contentinfo"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-3">
        {/* Logo */}
        <div>
          <Link
            href="/"
            className="font-serif text-2xl italic text-fg no-underline"
          >
            The QR <span className="text-accent">Spot</span>
          </Link>
          <p className="mt-1 text-xs text-muted">Pay once, own forever.</p>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-8 md:gap-10">
            <li>
              <Link
                href="/privacy"
                className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Support
              </Link>
            </li>
            <li>
              <a
                href="https://x.com/theqrspot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Follow us on Twitter"
              >
                Twitter
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-center text-[13px] text-muted md:text-right">
          &copy; 2026 Helios Innovations
        </p>
      </div>
    </footer>
  );
}
