"use client";

import Link from "next/link";

const freePlanFeatures: { text: string; included: boolean }[] = [
  { text: "Create unlimited QR codes", included: true },
  { text: "High resolution export (PNG, SVG, PDF, EPS)", included: true },
  { text: "Customize colors and styles", included: true },
  { text: "Multiple format support", included: true },
  { text: "Change where the QR points to", included: false },
  { text: "View scan analytics", included: false },
];

const paidFeatures: string[] = [
  "Change where the QR points to",
  "View scan analytics",
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-surface px-6 py-24 lg:px-12 lg:py-32"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <header className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Simple pricing
          </p>
          <h2
            id="pricing-heading"
            className="font-serif text-4xl leading-[1.15] tracking-tight text-fg md:text-5xl"
          >
            Simple Pricing.{" "}
            <span className="italic text-accent">No Subscriptions.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            Create unlimited QR codes for free. $1.99 to unlock editing and
            analytics per QR code.
          </p>
        </header>

        {/* Two Column Layout */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Tier Card */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              FREE
            </div>
            <h3 className="mt-4 font-serif text-2xl text-fg">
              Create Unlimited QR Codes
            </h3>
            <p className="mt-2 text-sm text-muted">
              Everything you need to create and export professional QR codes.
            </p>

            {/* Free tier features */}
            <ul className="mt-6 space-y-3" role="list">
              {freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm ${feature.included ? "text-fg" : "text-muted"}`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* $1.99 Unlock Card */}
          <div className="shadow-accent/10 relative overflow-hidden rounded-2xl border-2 border-accent bg-bg p-8 shadow-lg">
            {/* Price Badge */}
            <div className="mb-4">
              <span className="font-serif text-5xl text-fg">$1.99</span>
              <span className="ml-2 text-muted">per QR code</span>
            </div>

            <h3 className="font-serif text-2xl text-fg">
              Unlock Editing & Analytics
            </h3>
            <p className="mt-2 text-sm text-muted">
              One-time payment. No subscriptions. Own forever.
            </p>

            {/* Paid features */}
            <ul className="mt-6 space-y-3" role="list">
              {paidFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-fg">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              href="/generator"
              className="mt-8 block w-full rounded-lg bg-accent py-4 text-center font-semibold text-white transition-all duration-200 hover:bg-fg"
              aria-label="Create a QR code to unlock editing and analytics"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Lifetime access, no subscription</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>All major cards accepted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
