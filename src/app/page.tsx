import QRGenerator from "@/components/QRGenerator";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section - Two column layout */}
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-24 md:gap-20 lg:grid-cols-2 lg:px-12">
        {/* Left Column - Hero Content */}
        <div className="max-w-xl">
          {/* Date/Tagline */}
          <div className="mb-6 text-xs uppercase tracking-widest text-muted">
            Est. 2026 — No Subscriptions
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl leading-tight text-fg md:text-5xl lg:text-6xl">
            The QR code
            <br />
            that&apos;s <span className="italic text-accent">yours</span>
            <br />
            forever.
          </h1>

          {/* Description */}
          <p className="mt-8 text-lg leading-relaxed text-muted">
            Generate free. Pay <strong className="text-fg">$3.99 once</strong>{" "}
            to edit. Keep your QR code working forever. No monthly fees. No
            expiring links. Just honest, simple pricing.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-12 border-t border-border pt-8">
            <div className="text-left">
              <div className="font-serif text-4xl text-accent md:text-5xl">
                &infin;
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Edits included
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-4xl text-accent md:text-5xl">
                $0
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Monthly fees
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-4xl text-accent md:text-5xl">
                1x
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Payment only
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - QR Generator */}
        <div className="w-full lg:max-w-lg">
          <QRGenerator />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-fg px-6 py-24 text-bg lg:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 grid gap-8 md:grid-cols-2 md:items-end">
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              Simple, <span className="italic text-accent">honest</span>
              <br />
              pricing.
            </h2>
            <p className="text-lg opacity-70">
              Pay once. Edit forever. No subscriptions, no tricks. Your QR code,
              your rules.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-0.5 bg-white/10 md:grid-cols-2">
            {/* Single QR */}
            <div className="bg-fg p-12">
              <div className="mb-6 text-xs uppercase tracking-widest opacity-50">
                Single QR Code
              </div>
              <div className="mb-2 font-serif text-6xl md:text-7xl">
                <span className="align-top text-3xl opacity-60">$</span>3.99
              </div>
              <div className="mb-8 text-base opacity-70">One-time payment</div>
              <ul className="mb-10 space-y-4">
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Make one QR
                  editable
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Unlimited future
                  edits
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Never expires
                </li>
                <li className="flex items-center gap-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Scan analytics
                </li>
              </ul>
              <button className="w-full bg-bg py-4 text-sm font-semibold text-fg transition-transform hover:-translate-y-0.5">
                Get Started
              </button>
            </div>

            {/* Unlimited QR */}
            <div className="bg-accent p-12">
              <div className="mb-6 text-xs uppercase tracking-widest opacity-50">
                Unlimited QR Codes
              </div>
              <div className="mb-2 font-serif text-6xl md:text-7xl">
                <span className="align-top text-3xl opacity-60">$</span>9.99
              </div>
              <div className="mb-8 text-base opacity-70">One-time payment</div>
              <ul className="mb-10 space-y-4">
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> All QR codes
                  editable
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Unlimited future
                  edits
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Never expires
                </li>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Bulk generation
                </li>
                <li className="flex items-center gap-4 text-sm">
                  <span className="opacity-50">&rarr;</span> Priority support
                </li>
              </ul>
              <button className="w-full bg-fg py-4 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5">
                Get Unlimited
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl text-fg md:text-5xl">
              How it <span className="italic text-accent">works</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid border border-border md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative border-b border-border p-10 md:border-b-0 md:border-r">
              <div className="absolute right-6 top-6 font-serif text-8xl text-surface">
                01
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-2xl">
                  Create your <span className="text-accent">QR</span>
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Enter any URL. Your QR code generates instantly. Download as
                  PNG or SVG. No account required.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative border-b border-border p-10 md:border-b-0 md:border-r">
              <div className="absolute right-6 top-6 font-serif text-8xl text-surface">
                02
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-2xl">
                  Save to your <span className="text-accent">dashboard</span>
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Enter your email for magic link access. Your QR lives in the
                  cloud, ready whenever you need it.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-10">
              <div className="absolute right-6 top-6 font-serif text-8xl text-surface">
                03
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 font-serif text-2xl">
                  Edit <span className="text-accent">forever</span>
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Pay once. Update the destination URL as many times as you
                  want. The printed QR keeps working.
                </p>
              </div>
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
          <ul className="flex justify-center gap-8">
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
          </ul>

          {/* Copyright */}
          <div className="text-right text-sm text-muted">
            &copy; 2026 Helios Innovations
          </div>
        </div>
      </footer>
    </main>
  );
}
