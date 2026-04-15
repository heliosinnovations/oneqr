import Link from "next/link";

interface TemplateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TemplateCard({ icon, title, description }: TemplateCardProps) {
  return (
    <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md lg:p-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
        {icon}
      </div>
      <div>
        <h4 className="font-sans text-base font-semibold text-fg">{title}</h4>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

export default function TemplatesSection() {
  return (
    <section className="px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <header className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Smart Templates
          </p>
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-fg md:text-4xl lg:text-[44px]">
            10+ ready-to-use templates
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            From WiFi networks to digital business cards. Just fill in your
            details.
          </p>
        </header>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" />
              </svg>
            }
            title="WiFi"
            description="Share network credentials instantly"
          />

          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            title="vCard"
            description="Digital business card"
          />

          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            }
            title="WhatsApp"
            description="Start chat instantly"
          />

          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            title="Email"
            description="Pre-filled email drafts"
          />

          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            title="Location"
            description="Share GPS coordinates"
          />

          <TemplateCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
            title="Payment"
            description="UPI, PayPal, Venmo"
          />
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 font-semibold text-fg transition-colors hover:text-accent"
          >
            View all 10+ templates
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
