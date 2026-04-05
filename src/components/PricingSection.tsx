"use client";

import { useState } from "react";

interface PricingPlan {
  name: string;
  price: string;
  priceId: string;
  description: string;
  features: { text: string; included: boolean }[];
  popular?: boolean;
  inheritsFree?: boolean;
}

const freePlanFeatures: { text: string; included: boolean }[] = [
  { text: "Create unlimited QR codes", included: true },
  { text: "High resolution export (PNG, SVG, PDF, EPS)", included: true },
  { text: "Customize colors and styles", included: true },
  { text: "Multiple format support", included: true },
  { text: "Change where the QR points to", included: false },
  { text: "Analytics", included: false },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Single QR",
    price: "$3.99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE || "",
    description: "Unlock editing for one QR code (one-time payment)",
    features: [
      { text: "Change where the QR points to (1 QR code)", included: true },
      { text: "Analytics (1 QR code)", included: true },
    ],
    inheritsFree: true,
  },
  {
    name: "Unlimited QR",
    price: "$9.99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED || "",
    description: "Unlock editing for all QR codes (one-time payment)",
    features: [
      { text: "Change where the QR points to (unlimited)", included: true },
      { text: "Analytics (unlimited)", included: true },
    ],
    popular: true,
    inheritsFree: true,
  },
];

export default function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    if (!priceId) {
      console.error("Price ID is not configured");
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session:", data.error);
        setLoading(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(null);
    }
  };

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-surface px-6 py-24 lg:px-12 lg:py-32"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <header className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            One-time pricing
          </p>
          <h2
            id="pricing-heading"
            className="font-serif text-4xl leading-[1.15] tracking-tight text-fg md:text-5xl"
          >
            Simple Pricing.{" "}
            <span className="italic text-accent">No Subscriptions.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            Create and save unlimited QR codes for free. Pay only when you need
            to edit — one-time, no recurring fees.
          </p>
        </header>

        {/* Free Tier Card */}
        <div className="mb-12 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
            <div className="md:flex-1">
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
                Everything you need to create QR codes
              </h3>
              <p className="mt-2 text-muted">
                All pro features free. Pay only to edit content and view analytics.
              </p>
            </div>
          </div>

          {/* Free tier features grid */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-2" role="list">
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
                <span className={`text-sm ${feature.included ? "text-fg" : "text-muted"}`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl border bg-bg p-8 transition-all duration-300 lg:p-10 ${
                plan.popular
                  ? "shadow-accent/10 border-accent shadow-lg"
                  : "hover:border-accent/50 border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              <h3 className="mb-2 font-serif text-2xl text-fg">{plan.name}</h3>
              <p className="mb-6 text-sm text-muted">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="font-serif text-5xl text-fg">
                  {plan.price}
                </span>
                <span className="ml-2 text-muted">one-time</span>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-4" role="list">
                {plan.inheritsFree && (
                  <li className="flex items-start gap-3 border-b border-border pb-4 mb-4">
                    <span className="text-sm font-medium text-fg">Everything in Free, plus:</span>
                  </li>
                )}
                {plan.features.map((feature, index) => (
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
                    <span className="text-sm text-fg">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePurchase(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full rounded-lg py-4 text-center font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "disabled:bg-accent/50 bg-accent text-white hover:bg-fg"
                    : "border border-border bg-surface text-fg hover:border-accent hover:bg-accent hover:text-white disabled:opacity-50"
                }`}
                aria-label={`Buy ${plan.name} for ${plan.price}`}
              >
                {loading === plan.priceId ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Buy Now - ${plan.price}`
                )}
              </button>
            </div>
          ))}
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
