import SimpleQRGenerator from "@/components/SimpleQRGenerator";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <header>
        <nav
          className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
            {/* Logo */}
            <Link
              href="/"
              className="font-serif text-[28px] italic text-fg"
              aria-label="The QR Spot - Home"
            >
              The QR <span className="text-accent">Spot</span>
            </Link>
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
              Create QR codes. <span className="italic text-accent">Free</span>{" "}
              forever.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              No account required. No credit card. No limits.
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
          className="scroll-mt-20 bg-fg px-6 py-[120px] text-bg lg:px-12"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-5xl">
            {/* Section Header */}
            <header className="mb-16 text-center">
              <h2
                id="features-heading"
                className="font-serif text-[56px] leading-[1.1]"
              >
                Professional QR codes.
                <br />
                <span className="italic text-accent">Free</span> forever.
              </h2>
            </header>

            {/* Features Grid */}
            <ul
              className="grid gap-px bg-white/10 md:grid-cols-2"
              role="list"
              aria-label="Product features"
            >
              <li className="bg-fg p-10">
                <div
                  className="mb-4 text-4xl"
                  role="img"
                  aria-label="High Resolution"
                >
                  🖼️
                </div>
                <h3 className="mb-3 font-serif text-xl">
                  High-Resolution Export
                </h3>
                <p className="text-sm leading-relaxed opacity-70">
                  Export from 512px up to 4096px. Perfect for billboards,
                  posters, and large format printing.
                </p>
              </li>
              <li className="bg-fg p-10">
                <div
                  className="mb-4 text-4xl"
                  role="img"
                  aria-label="File Formats"
                >
                  📁
                </div>
                <h3 className="mb-3 font-serif text-xl">Multi-Format Export</h3>
                <p className="text-sm leading-relaxed opacity-70">
                  Download as PNG, SVG, PDF, or EPS. Vector formats for infinite
                  scaling, raster for quick sharing.
                </p>
              </li>
              <li className="bg-fg p-10">
                <div
                  className="mb-4 text-4xl"
                  role="img"
                  aria-label="Print Quality"
                >
                  🖨️
                </div>
                <h3 className="mb-3 font-serif text-xl">
                  Print Quality Controls
                </h3>
                <p className="text-sm leading-relaxed opacity-70">
                  Set DPI from 72 to 600 with a built-in size calculator. Know
                  exactly how your QR will print.
                </p>
              </li>
              <li className="bg-fg p-10">
                <div className="mb-4 text-4xl" role="img" aria-label="Design">
                  🎨
                </div>
                <h3 className="mb-3 font-serif text-xl">Advanced Design</h3>
                <p className="text-sm leading-relaxed opacity-70">
                  6 data patterns, 9 eye styles, gradient support, and custom
                  colors. Make your QR code stand out.
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
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border bg-bg px-6 py-12 lg:px-12"
        role="contentinfo"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-3">
          {/* Logo */}
          <div className="font-serif text-2xl italic text-fg">
            The QR <span className="text-accent">Spot</span>
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
