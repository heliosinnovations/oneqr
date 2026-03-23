export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          {/* Logo */}
          <h1 className="font-serif text-4xl italic text-fg md:text-5xl">
            One<span className="text-accent">QR</span>
          </h1>

          {/* Tagline */}
          <p className="mt-8 font-serif text-3xl leading-tight text-fg md:text-5xl">
            The QR code that&apos;s{" "}
            <span className="italic text-accent">yours</span> forever.
          </p>

          {/* Description */}
          <p className="mt-6 text-lg text-muted">
            Generate free. Pay <strong className="text-fg">$3.99 once</strong>{" "}
            to edit. Keep your QR code working forever. No monthly fees. No
            expiring links. Just honest, simple pricing.
          </p>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="w-full rounded-none bg-fg px-8 py-4 text-sm font-semibold text-bg transition-colors hover:bg-accent sm:w-auto">
              Generate QR Code
            </button>
            <button className="w-full rounded-none border border-border bg-transparent px-8 py-4 text-sm font-semibold text-fg transition-colors hover:bg-surface sm:w-auto">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex justify-center gap-12 border-t border-border pt-8">
            <div className="text-left">
              <div className="font-serif text-4xl text-accent">&infin;</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Edits included
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-4xl text-accent">$0</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Monthly fees
              </div>
            </div>
            <div className="text-left">
              <div className="font-serif text-4xl text-accent">1x</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                Payment only
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
