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
                href="#pricing"
                className="group relative text-sm font-medium text-fg transition-colors"
              >
                Pricing
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
            Est. 2026 — No Subscriptions
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-fg md:text-6xl lg:text-7xl">
            The QR code
            <br />
            that&apos;s <span className="italic text-accent">yours</span>
            <br />
            forever.
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-[480px] text-xl leading-[1.7] text-muted">
            Generate free. Pay <strong className="text-fg">$3.99 once</strong>{" "}
            to edit. Keep your QR code working forever. No monthly fees. No
            expiring links. Just honest, simple pricing.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-12 border-t border-border pt-8">
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                &infin;
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                Edits included
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                $0
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                Monthly fees
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl leading-none text-accent">
                1x
              </div>
              <div className="mt-1 text-[13px] uppercase tracking-wider text-muted">
                Payment only
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
                  Create your <span className="text-accent">QR</span>
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted">
                  Enter any URL. Your QR code generates instantly. Download as
                  PNG or SVG. No account required.
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
                  Enter your email for magic link access. Your QR lives in the
                  cloud, ready whenever you need it.
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
                  Edit <span className="text-accent">forever</span>
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted">
                  Pay once. Update the destination URL as many times as you
                  want. The printed QR keeps working.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="scroll-mt-20 bg-fg px-6 py-[120px] text-bg lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 grid gap-12 md:grid-cols-2 md:items-end">
            <h2 className="font-serif text-[56px] leading-[1.1]">
              Simple, <span className="italic text-accent">honest</span>
              <br />
              pricing.
            </h2>
            <p className="text-lg leading-[1.7] opacity-70">
              Pay once. Edit forever. No subscriptions, no tricks. Your QR code,
              your rules.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-0.5 bg-white/10 md:grid-cols-2">
            {/* Single QR */}
            <div className="bg-fg p-12 md:p-14">
              <div className="mb-6 text-[11px] uppercase tracking-[3px] opacity-50">
                Single QR Code
              </div>
              <div className="mb-2 font-serif text-[72px] leading-none">
                <span className="align-top text-4xl opacity-60">$</span>3.99
              </div>
              <div className="mb-8 text-base opacity-70">One-time payment</div>
              <ul className="mb-10 space-y-0">
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Make one QR
                  editable
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Unlimited future
                  edits
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Never expires
                </li>
                <li className="flex items-center gap-4 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Scan analytics
                </li>
              </ul>
              <button className="w-full bg-bg py-[18px] text-[15px] font-semibold text-fg transition-transform hover:-translate-y-0.5">
                Get Started
              </button>
            </div>

            {/* Unlimited QR */}
            <div className="bg-accent p-12 md:p-14">
              <div className="mb-6 text-[11px] uppercase tracking-[3px] opacity-50">
                Unlimited QR Codes
              </div>
              <div className="mb-2 font-serif text-[72px] leading-none">
                <span className="align-top text-4xl opacity-60">$</span>9.99
              </div>
              <div className="mb-8 text-base opacity-70">One-time payment</div>
              <ul className="mb-10 space-y-0">
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> All QR codes
                  editable
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Unlimited future
                  edits
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Never expires
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Bulk generation
                </li>
                <li className="flex items-center gap-4 py-[14px] text-[15px]">
                  <span className="opacity-50">&rarr;</span> Priority support
                </li>
              </ul>
              <button className="w-full bg-fg py-[18px] text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5">
                Get Unlimited
              </button>
            </div>
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
