interface UseCaseCardProps {
  emoji: string;
  title: string;
  description: string;
}

function UseCaseCard({ emoji, title, description }: UseCaseCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center lg:p-8">
      <div className="mb-4 text-4xl">{emoji}</div>
      <h4 className="mb-2 font-serif text-lg text-fg">{title}</h4>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

export default function UseCasesSection() {
  return (
    <section className="bg-surface px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <header className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Perfect For
          </p>
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-fg md:text-4xl lg:text-[44px]">
            Every industry. Every use case.
          </h2>
        </header>

        {/* Use Cases Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard
            emoji="🍽️"
            title="Restaurants"
            description="Digital menus and ordering"
          />
          <UseCaseCard
            emoji="🛍️"
            title="Retail"
            description="Product info and promotions"
          />
          <UseCaseCard
            emoji="🎫"
            title="Events"
            description="Check-in and ticketing"
          />
          <UseCaseCard
            emoji="💼"
            title="Business Cards"
            description="Digital contact sharing"
          />
          <UseCaseCard
            emoji="🏠"
            title="Real Estate"
            description="Property tours and info"
          />
          <UseCaseCard
            emoji="📶"
            title="WiFi Sharing"
            description="Guest network access"
          />
        </div>
      </div>
    </section>
  );
}
