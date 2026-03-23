import QRGenerator from "@/components/QRGenerator";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="font-serif text-[28px] italic text-fg">
            One<span className="text-accent">QR</span>
          </Link>

          {/* Nav Links - Hidden on mobile */}
          <ul className="hidden gap-10 md:flex">
            <li>
              <Link
                href="#how-it-works"
                className="group relative text-sm font-medium text-fg transition-colors"
              >
                How it works
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
            <li>
              <Link
                href="#features"
                className="group relative text-sm font-medium text-fg transition-colors"
              >
                Features
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          </ul>

          {/* CTA Button */}
          <button className="bg-fg px-7 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section - Two column layout */}
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:gap-20 lg:grid-cols-2 lg:px-12 lg:pb-24 lg:pt-36">
        {/* Left Column - Hero Content */}
        <div className="max-w-xl">
          {/* Date/Tagline */}
          <div className="mb-6 text-xs uppercase tracking-[3px] text-muted">
            Est. 2026 — Completely Free
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-fg md:text-6xl lg:text-7xl">
            Create, download,
            <br />
            and print QR codes.
            <br />
            <span className="italic text-accent">Free</span> forever.
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-[480px] text-xl leading-[1.7] text-muted">
            Generate unlimited QR codes. Download as PNG or SVG. Print and share
            anywhere. No account required, no credit card, no expiration dates.
            Completely free.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-12 border-t border-border pt-8">
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                &infin;
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                QR codes to create
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                $0
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                Forever
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                0
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                Accounts required
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - QR Generator */}
        <div className="w-full lg:max-w-none">
          <QRGenerator />
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="scroll-mt-20 px-6 py-[120px] lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <h2 className="font-serif text-5xl text-fg md:text-[56px]">
              How it <span className="italic text-accent">works</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid border border-border md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative border-b border-border p-10 md:border-b-0 md:border-r md:p-14">
              <div className="absolute right-6 top-6 font-serif text-[120px] leading-none text-surface">
                01
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-[28px]">
                  Create <span className="text-accent">free</span> QR codes
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted">
                  Enter any URL. Your QR code generates instantly. Download as
                  PNG or SVG. Print, share, use anywhere. Completely free.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative border-b border-border p-10 md:border-b-0 md:border-r md:p-14">
              <div className="absolute right-6 top-6 font-serif text-[120px] leading-none text-surface">
                02
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-[28px]">
                  Save to your <span className="text-accent">dashboard</span>
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted">
                  Want to save your QR codes? Enter your email for free magic
                  link access. No password, no hassle.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-10 md:p-14">
              <div className="absolute right-6 top-6 font-serif text-[120px] leading-none text-surface">
                03
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-[28px]">
                  Need to <span className="text-accent">edit</span> later?
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted">
                  Unlock editing for any QR code. One small payment unlocks
                  unlimited edits forever. Your printed QR keeps working.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="scroll-mt-20 bg-fg px-6 py-[120px] text-bg lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="font-serif text-[56px] leading-[1.1]">
              Everything you need.
              <br />
              <span className="italic text-accent">Nothing</span> you don&apos;t.
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid gap-px bg-white/10 md:grid-cols-3">
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">📱</div>
              <h3 className="mb-3 font-serif text-xl">Instant Generation</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Enter a URL, get a QR code. Download PNG or SVG. No signup, no
                wait.
              </p>
            </div>
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">☁️</div>
              <h3 className="mb-3 font-serif text-xl">Cloud Storage</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Save QR codes to your dashboard. Access from anywhere with magic
                link login.
              </p>
            </div>
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">♾️</div>
              <h3 className="mb-3 font-serif text-xl">No Limits</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Create unlimited QR codes. Download as many times as you want.
                Forever free.
              </p>
            </div>
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">✏️</div>
              <h3 className="mb-3 font-serif text-xl">Optional Editing</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Need to change where your QR points? Unlock editing for a small
                one-time fee.
              </p>
            </div>
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-3 font-serif text-xl">Scan Analytics</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Track how many people scan your QR codes. See what&apos;s working.
              </p>
            </div>
            <div className="bg-fg p-10">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-3 font-serif text-xl">Never Expires</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Your QR codes work forever. No monthly fees, no surprise charges.
              </p>
            </div>
          </div>

          {/* Subtle pricing mention */}
          <div className="mt-16 border-t border-white/10 pt-12 text-center">
            <p className="text-lg leading-relaxed opacity-70">
              Editing unlocks at $3.99 per QR or $9.99 for unlimited.
              <br />
              <span className="text-sm opacity-50">One-time payment. No subscriptions.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-3">
          {/* Logo */}
          <div className="font-serif text-2xl italic text-fg">
            One<span className="text-accent">QR</span>
          </div>

          {/* Links */}
          <ul className="flex flex-wrap justify-center gap-8 md:gap-10">
            <li>
              <a
                href="#"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                Support
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                Twitter
              </a>
            </li>
          </ul>

          {/* Copyright */}
          <div className="text-center text-[13px] text-muted md:text-right">
            &copy; 2026 Helios Innovations
          </div>
        </div>
      </footer>
    </main>
  );
}
