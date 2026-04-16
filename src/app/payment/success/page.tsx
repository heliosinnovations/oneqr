"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [qrTitle, setQrTitle] = useState<string | null>(null);

  const qrId = searchParams.get("qr_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!qrId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      const supabase = createClient();

      // Poll for the QR code to be unlocked (webhook may take a moment)
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 1000;

      const checkStatus = async (): Promise<boolean> => {
        const { data: qr, error } = await supabase
          .from("qr_codes")
          .select("title, is_editable")
          .eq("id", qrId)
          .single();

        if (error || !qr) {
          return false;
        }

        setQrTitle(qr.title);

        if (qr.is_editable) {
          return true;
        }

        return false;
      };

      // Check immediately
      if (await checkStatus()) {
        setStatus("success");
        return;
      }

      // Poll for updates
      const poll = async () => {
        attempts++;
        if (await checkStatus()) {
          setStatus("success");
        } else if (attempts >= maxAttempts) {
          // Even if not updated yet, show success (webhook will update soon)
          setStatus("success");
        } else {
          setTimeout(poll, pollInterval);
        }
      };

      setTimeout(poll, pollInterval);
    };

    verifyPayment();
  }, [qrId, sessionId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
          <h1 className="mb-2 font-serif text-2xl text-[var(--fg)]">
            Processing Payment...
          </h1>
          <p className="text-[var(--muted)]">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-10 w-10 text-red-500"
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
            Something went wrong
          </h1>
          <p className="mb-8 text-[var(--muted)]">
            We couldn&apos;t verify your payment. Please contact support if
            you&apos;ve been charged.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d1e7dd]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-10 w-10 text-[#198754]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-3 font-serif text-3xl text-[var(--fg)]">
          Payment Successful!
        </h1>

        <p className="mb-2 text-[var(--muted)]">
          Your QR code has been unlocked.
        </p>

        {qrTitle && (
          <p className="mb-8 text-lg font-medium text-[var(--fg)]">
            &ldquo;{qrTitle}&rdquo;
          </p>
        )}

        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            You can now edit the destination URL anytime, and track scan
            analytics.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                router.push(`/dashboard?refresh=true&highlight=${qrId}`)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit QR Code Now
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-8 py-4 text-base font-semibold text-[var(--fg)] transition-all hover:bg-[var(--surface)]"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Receipt
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[var(--fg)]">Dynamic QR Edit Unlock</span>
            <span className="font-semibold text-[var(--fg)]">$1.99</span>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            A receipt has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
