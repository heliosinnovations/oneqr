"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Countdown timer for redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
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
        </div>

        {/* Success Message */}
        <h1 className="mb-4 font-serif text-3xl text-fg">
          Payment Successful!
        </h1>
        <p className="mb-8 text-lg text-muted">
          Thank you for your purchase. Your QR code plan has been activated.
        </p>

        {/* Session ID (for reference) */}
        {sessionId && (
          <p className="mb-6 text-xs text-muted">
            Reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Redirect Notice */}
        <p className="mb-8 text-sm text-muted">
          Redirecting to home in{" "}
          <span className="font-semibold text-accent">{countdown}</span>{" "}
          seconds...
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-fg"
          >
            Go to Home
          </Link>
          <Link
            href="/generator"
            className="inline-flex items-center justify-center border border-border bg-surface px-8 py-3 font-semibold text-fg transition-colors hover:bg-border"
          >
            Create QR Code
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-surface"></div>
        <div className="mx-auto mb-4 h-8 w-48 animate-pulse rounded bg-surface"></div>
        <div className="mx-auto h-4 w-64 animate-pulse rounded bg-surface"></div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
