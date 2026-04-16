"use client";

import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md text-center">
        {/* Cancelled Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-10 w-10 text-[var(--muted)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="mb-3 font-serif text-3xl text-[var(--fg)]">
          Payment Cancelled
        </h1>

        <p className="mb-8 text-[var(--muted)]">
          No worries! Your QR code is still saved. You can unlock editing
          anytime.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
          >
            Return to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-8 py-4 text-base font-semibold text-[var(--fg)] transition-all hover:bg-[var(--surface)]"
          >
            Create New QR Code
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
          <h3 className="mb-3 font-semibold text-[var(--fg)]">
            Why unlock editing?
          </h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex items-start gap-2">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Change the destination URL anytime
            </li>
            <li className="flex items-start gap-2">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Track scan analytics and locations
            </li>
            <li className="flex items-start gap-2">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              One-time payment of just $1.99
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
