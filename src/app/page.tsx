import SimpleQRGenerator from "@/components/SimpleQRGenerator";
import ComparisonSection from "@/components/ComparisonSection";
import PricingSection from "@/components/PricingSection";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <header>
        <nav
          className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="font-serif text-[28px] italic text-fg"
                aria-label="The QR Spot - Home"
              >
                The QR <span className="text-accent">Spot</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/generator"
                className="hidden text-sm font-medium text-muted transition-colors hover:text-fg sm:block"
              >
                Advanced Generator
              </Link>
              <Link
                href="/bulk"
                className="text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                Bulk Creation
              </Link>
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" className="min-h-screen bg-bg">
        {/* Hero Section - Full width QR generator */}
        <section
          className="mx-auto max-w-7xl px-6 pb-20 pt-24 lg:px-12 lg:pb-24 lg:pt-28"
          aria-labelledby="hero-heading"
        >
          {/* Minimal heading above the fold */}
          <header className="mb-12 text-center">
            <h1
              id="hero-heading"
              className="font-serif text-4xl leading-[1.1] tracking-tight text-fg md:text-5xl lg:text-6xl"
            >
              Create unlimited QR codes{" "}
              <span className="italic text-accent">free</span>.
              <br />
              <span className="text-accent">$1.99 to unlock editing.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              No subscriptions. Pay once per QR code to unlock editing and analytics.
            </p>
          </header>

          {/* Full-width QR Generator - Above the fold */}
          <div id="qr-generator" className="mx-auto max-w-lg scroll-mt-24">
            <SimpleQRGenerator />
          </div>

          {/* Stats - Below generator */}
          <div
            className="mx-auto mt-16 flex max-w-3xl justify-center gap-12 border-t border-border pt-10 md:gap-20"
            role="list"
            aria-label="Key statistics"
          >
            <div className="text-center" role="listitem">
              <div
                className="font-serif text-5xl leading-none text-accent"
                aria-hidden="true"
              >
                &infin;
              </div>
              <div className="mt-2 text-[13px] uppercase tracking-wider text-muted">
                <span className="sr-only">Unlimited</span> QR codes
              </div>
            </div>
            <div className="text-center" role="listitem">
              <div className="font-serif text-5xl leading-none text-accent">
                $0
              </div>
              <div className="mt-2 text-[13px] uppercase tracking-wider text-muted">
                Forever
              </div>
            </div>
            <div className="text-center" role="listitem">
              <div className="font-serif text-5xl leading-none text-accent">
                0
              </div>
              <div className="mt-2 text-[13px] uppercase tracking-wider text-muted">
                Accounts
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="scroll-mt-20 bg-fg px-6 py-24 text-bg lg:px-12 lg:py-32"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <header className="mb-20 text-center">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Built for professionals
              </p>
              <h2
                id="features-heading"
                className="font-serif text-4xl leading-[1.15] tracking-tight md:text-5xl lg:text-[56px]"
              >
                Professional QR codes.
                <br />
                <span className="italic text-accent">Free to create.</span> $1.99
                to edit.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60">
                Create unlimited QR codes free. Pay $1.99 per QR to unlock editing and analytics.
              </p>
            </header>

            {/* Features Grid */}
            <ul
              className="grid gap-px md:grid-cols-2"
              role="list"
              aria-label="Product features"
            >
              <li className="group relative bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-accent">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      {/* QR code with expanding sizes */}
                      <rect x="2" y="2" width="5" height="5" rx="0.5" />
                      <rect x="2" y="25" width="5" height="5" rx="0.5" />
                      <rect x="25" y="2" width="5" height="5" rx="0.5" />
                      <rect x="9" y="2" width="2" height="2" />
                      <rect x="13" y="2" width="2" height="2" />
                      <rect x="9" y="6" width="2" height="2" />
                      <rect x="2" y="9" width="2" height="2" />
                      <rect x="2" y="13" width="2" height="2" />
                      <rect x="9" y="25" width="2" height="2" />
                      <rect x="13" y="25" width="2" height="2" />
                      <rect x="9" y="29" width="2" height="2" />
                      {/* Expanding arrows */}
                      <path d="M18 14 L22 14 L22 10 M22 14 L22 18 L26 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">
                    High Resolution <span className="text-accent">Export</span>
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-white/60">
                  Export from 512px up to 4096px. Perfect for billboards,
                  posters, and large format printing. Print-ready quality at any size.
                </p>
              </li>

              <li className="group relative bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-accent">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      {/* Layered QR codes representing multiple formats */}
                      <g opacity="0.3">
                        <rect x="6" y="6" width="4" height="4" rx="0.5" />
                        <rect x="6" y="22" width="4" height="4" rx="0.5" />
                        <rect x="22" y="6" width="4" height="4" rx="0.5" />
                        <rect x="12" y="6" width="1.5" height="1.5" />
                        <rect x="6" y="12" width="1.5" height="1.5" />
                      </g>
                      <g opacity="0.6">
                        <rect x="4" y="4" width="4" height="4" rx="0.5" />
                        <rect x="4" y="20" width="4" height="4" rx="0.5" />
                        <rect x="20" y="4" width="4" height="4" rx="0.5" />
                        <rect x="10" y="4" width="1.5" height="1.5" />
                        <rect x="4" y="10" width="1.5" height="1.5" />
                      </g>
                      <g>
                        <rect x="2" y="2" width="4" height="4" rx="0.5" />
                        <rect x="2" y="18" width="4" height="4" rx="0.5" />
                        <rect x="18" y="2" width="4" height="4" rx="0.5" />
                        <rect x="8" y="2" width="1.5" height="1.5" />
                        <rect x="2" y="8" width="1.5" height="1.5" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">
                    Multi-Format <span className="text-accent">Export</span>
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-white/60">
                  Download as PNG, SVG, PDF, or EPS. Vector formats for infinite
                  scaling, raster for quick sharing. Works with any design tool.
                </p>
              </li>

              <li className="group relative bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-accent">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      {/* QR code with print quality indicators */}
                      <rect x="2" y="8" width="4" height="4" rx="0.5" />
                      <rect x="2" y="20" width="4" height="4" rx="0.5" />
                      <rect x="20" y="8" width="4" height="4" rx="0.5" />
                      <rect x="8" y="8" width="1.5" height="1.5" />
                      <rect x="12" y="8" width="1.5" height="1.5" />
                      <rect x="8" y="12" width="1.5" height="1.5" />
                      <rect x="2" y="14" width="1.5" height="1.5" />
                      <rect x="8" y="20" width="1.5" height="1.5" />
                      <rect x="12" y="20" width="1.5" height="1.5" />
                      {/* Print measurement lines */}
                      <line x1="26" y1="8" x2="30" y2="8" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="26" y1="24" x2="30" y2="24" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="28" y1="8" x2="28" y2="24" stroke="currentColor" strokeWidth="1.5" />
                      {/* Tick marks */}
                      <line x1="27" y1="12" x2="29" y2="12" stroke="currentColor" strokeWidth="1" />
                      <line x1="27" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="1" />
                      <line x1="27" y1="20" x2="29" y2="20" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">
                    Print Quality <span className="text-accent">Controls</span>
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-white/60">
                  Set DPI from 72 to 600 with a built-in size calculator. Know
                  exactly how your QR will print. Professional output every time.
                </p>
              </li>

              <li className="group relative bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-accent">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      {/* QR code with gradient/style variation */}
                      <defs>
                        <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                      {/* Corner blocks with rounded edges */}
                      <rect x="2" y="2" width="5" height="5" rx="1" fill="url(#qr-gradient)" />
                      <rect x="2" y="25" width="5" height="5" rx="1" fill="url(#qr-gradient)" />
                      <rect x="25" y="2" width="5" height="5" rx="1" fill="url(#qr-gradient)" />
                      {/* Styled data modules */}
                      <circle cx="10" cy="3" r="1" opacity="0.8" />
                      <circle cx="14" cy="3" r="1" opacity="0.6" />
                      <circle cx="18" cy="3" r="1" opacity="0.4" />
                      <circle cx="10" cy="7" r="1" opacity="0.7" />
                      <circle cx="3" cy="10" r="1" opacity="0.8" />
                      <circle cx="3" cy="14" r="1" opacity="0.6" />
                      <circle cx="3" cy="18" r="1" opacity="0.4" />
                      <circle cx="7" cy="10" r="1" opacity="0.7" />
                      <circle cx="10" cy="26" r="1" opacity="0.8" />
                      <circle cx="14" cy="26" r="1" opacity="0.6" />
                      <circle cx="10" cy="30" r="1" opacity="0.7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">
                    Advanced <span className="text-accent">Design</span>
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-white/60">
                  6 data patterns, 9 eye styles, gradient support, and custom
                  colors. Make your QR code stand out from the crowd.
                </p>
              </li>
            </ul>

            {/* CTA to advanced generator */}
            <aside className="mt-16 border-t border-white/10 pt-12 text-center">
              <Link
                href="/generator"
                className="inline-flex items-center gap-3 bg-accent px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white hover:text-fg"
              >
                Try Advanced Generator
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="mt-4 text-sm opacity-50">
                All features are free. No signup required.
              </p>
            </aside>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Comparison Section */}
        <ComparisonSection />
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border bg-bg px-6 py-12 lg:px-12"
        role="contentinfo"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-3">
          {/* Logo */}
          <div>
            <div className="font-serif text-2xl italic text-fg">
              The QR <span className="text-accent">Spot</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Pay once, own forever.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-8 md:gap-10">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
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
    </>
  );
}
