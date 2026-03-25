import SimpleQRGenerator from "@/components/SimpleQRGenerator";
import ComparisonSection from "@/components/ComparisonSection";
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
            <Link
              href="/"
              className="font-serif text-[28px] italic text-fg"
              aria-label="The QR Spot - Home"
            >
              The QR <span className="text-accent">Spot</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/generator"
                className="hidden text-sm font-medium text-muted transition-colors hover:text-fg sm:block"
              >
                Advanced Generator
              </Link>
              <Link
                href="/bulk"
                className="bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fg"
              >
                Bulk Creation
              </Link>
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
                <span className="italic text-accent">Free</span> forever.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60">
                Enterprise-grade features without the enterprise price tag.
                Everything you need to create stunning QR codes.
              </p>
            </header>

            {/* Features Grid */}
            <ul
              className="grid gap-6 md:grid-cols-2 lg:gap-8"
              role="list"
              aria-label="Product features"
            >
              <li className="hover:border-accent/30 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] lg:p-10">
                <div className="bg-accent/10 group-hover:bg-accent/20 absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full blur-3xl transition-all duration-500" />
                <div
                  className="from-accent/20 to-accent/5 ring-accent/20 relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ring-1"
                  role="img"
                  aria-label="High Resolution"
                >
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <h3 className="relative mb-3 font-serif text-xl tracking-tight lg:text-2xl">
                  High-Resolution Export
                </h3>
                <p className="relative text-sm leading-relaxed text-white/60 lg:text-base lg:leading-relaxed">
                  Export from 512px up to 4096px. Perfect for billboards,
                  posters, and large format printing.
                </p>
                <div className="relative mt-6 flex items-center gap-2 text-xs font-medium text-accent">
                  <span className="bg-accent/10 rounded-full px-3 py-1">
                    Up to 4K
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
                    Print-ready
                  </span>
                </div>
              </li>

              <li className="hover:border-accent/30 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] lg:p-10">
                <div className="bg-accent/10 group-hover:bg-accent/20 absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full blur-3xl transition-all duration-500" />
                <div
                  className="from-accent/20 to-accent/5 ring-accent/20 relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ring-1"
                  role="img"
                  aria-label="File Formats"
                >
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <h3 className="relative mb-3 font-serif text-xl tracking-tight lg:text-2xl">
                  Multi-Format Export
                </h3>
                <p className="relative text-sm leading-relaxed text-white/60 lg:text-base lg:leading-relaxed">
                  Download as PNG, SVG, PDF, or EPS. Vector formats for infinite
                  scaling, raster for quick sharing.
                </p>
                <div className="relative mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="bg-accent/10 rounded-full px-3 py-1 text-accent">
                    PNG
                  </span>
                  <span className="bg-accent/10 rounded-full px-3 py-1 text-accent">
                    SVG
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
                    PDF
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
                    EPS
                  </span>
                </div>
              </li>

              <li className="hover:border-accent/30 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] lg:p-10">
                <div className="bg-accent/10 group-hover:bg-accent/20 absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full blur-3xl transition-all duration-500" />
                <div
                  className="from-accent/20 to-accent/5 ring-accent/20 relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ring-1"
                  role="img"
                  aria-label="Print Quality"
                >
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                    />
                  </svg>
                </div>
                <h3 className="relative mb-3 font-serif text-xl tracking-tight lg:text-2xl">
                  Print Quality Controls
                </h3>
                <p className="relative text-sm leading-relaxed text-white/60 lg:text-base lg:leading-relaxed">
                  Set DPI from 72 to 600 with a built-in size calculator. Know
                  exactly how your QR will print.
                </p>
                <div className="relative mt-6 flex items-center gap-2 text-xs font-medium text-accent">
                  <span className="bg-accent/10 rounded-full px-3 py-1">
                    72-600 DPI
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
                    Size calc
                  </span>
                </div>
              </li>

              <li className="hover:border-accent/30 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] lg:p-10">
                <div className="bg-accent/10 group-hover:bg-accent/20 absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full blur-3xl transition-all duration-500" />
                <div
                  className="from-accent/20 to-accent/5 ring-accent/20 relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ring-1"
                  role="img"
                  aria-label="Design"
                >
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                    />
                  </svg>
                </div>
                <h3 className="relative mb-3 font-serif text-xl tracking-tight lg:text-2xl">
                  Advanced Design
                </h3>
                <p className="relative text-sm leading-relaxed text-white/60 lg:text-base lg:leading-relaxed">
                  6 data patterns, 9 eye styles, gradient support, and custom
                  colors. Make your QR code stand out.
                </p>
                <div className="relative mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="bg-accent/10 rounded-full px-3 py-1 text-accent">
                    6 patterns
                  </span>
                  <span className="bg-accent/10 rounded-full px-3 py-1 text-accent">
                    9 styles
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
                    Gradients
                  </span>
                </div>
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
