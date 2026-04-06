"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function PaymentCancelledPage() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-md text-center">
          {/* Cancel Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-10 w-10 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Cancellation Message */}
          <h1 className="mb-4 font-serif text-3xl text-fg">
            Payment Cancelled
          </h1>
          <p className="mb-8 text-lg text-muted">
            No worries! Your payment was not processed and you have not been
            charged.
          </p>

          {/* Helpful Text */}
          <p className="mb-8 text-sm text-muted">
            If you encountered any issues or have questions, feel free to reach
            out to our support team.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-fg"
            >
              Back to Home
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center border border-border bg-surface px-8 py-3 font-semibold text-fg transition-colors hover:bg-border"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
