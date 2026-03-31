"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";

interface QRCodeData {
  id: string;
  title: string;
  short_code: string;
  destination_url: string;
  is_editable: boolean;
}

interface EditModalProps {
  qrCode: QRCodeData;
  mode: "edit" | "upgrade";
  onClose: () => void;
  onUpdate: (newUrl: string) => void;
}

type PricingPlan = "single" | "unlimited";

export default function EditModal({
  qrCode,
  mode,
  onClose,
  onUpdate,
}: EditModalProps) {
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>("single");

  const supabase = createClient();

  // Generate QR preview
  useEffect(() => {
    QRCode.toDataURL(qrCode.destination_url, {
      width: 88,
      margin: 1,
      color: { dark: "#1a1a1a", light: "#f7f6f1" },
    }).then(setQrPreview);
  }, [qrCode.destination_url]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return false;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      setError("Please enter a valid URL");
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateUrl(newUrl)) return;

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        destination_url: newUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCode.id);

    if (updateError) {
      console.error("Error updating QR code:", updateError);
      setError("Failed to update QR code. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess(true);
    onUpdate(newUrl);

    // Close after showing success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleUpgrade = async (plan: PricingPlan = selectedPlan) => {
    setProcessingPayment(true);

    try {
      // Get the price ID based on selected plan
      const priceId =
        plan === "unlimited"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE;

      // Call checkout API with selected price
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          qrCodeId: qrCode.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError("Failed to start payment process");
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to start payment process");
      setProcessingPayment(false);
    }
  };

  // Edit Mode UI
  if (mode === "edit") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[rgba(26,26,26,0.6)] backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="animate-in fade-in zoom-in-95 relative w-full max-w-[480px] overflow-hidden rounded-[20px] bg-[var(--bg)] shadow-2xl duration-200">
          {success ? (
            // Success State
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d1e7dd]">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-[#198754]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-serif text-xl text-[var(--fg)]">
                URL Updated!
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Your QR code now redirects to the new destination.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <h2 className="font-serif text-xl text-[var(--fg)]">
                  Edit QR Destination
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] transition-colors hover:bg-[var(--border)]"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px] text-[var(--muted)]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* QR Info Row */}
                <div className="mb-6 flex items-center gap-4 rounded-xl bg-[var(--surface)] p-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white">
                    {qrPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrPreview}
                        alt="QR preview"
                        className="h-11 w-11"
                      />
                    ) : (
                      <div className="h-11 w-11 animate-pulse rounded bg-[var(--border)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[var(--fg)]">
                      {qrCode.title}
                    </div>
                    <div className="truncate text-xs text-[var(--muted)]">
                      theqrspot.com/r/{qrCode.short_code}
                    </div>
                  </div>
                </div>

                {/* Current URL */}
                <div className="mb-4 rounded-lg bg-[var(--surface)] p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Current destination
                  </div>
                  <div className="mt-1 break-all text-sm text-[var(--fg)]">
                    {qrCode.destination_url}
                  </div>
                </div>

                {/* New URL Input */}
                <div>
                  <label
                    htmlFor="new-url"
                    className="mb-2 block text-sm font-semibold text-[var(--fg)]"
                  >
                    New Destination URL
                  </label>
                  <input
                    id="new-url"
                    type="url"
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="https://example.com/new-page"
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] transition-all focus:outline-none ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-light)]"
                    } focus:ring-4`}
                  />
                  {error ? (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Enter the new URL where your QR code should redirect
                    </p>
                  )}
                </div>

                {/* Warning */}
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-[#fff3cd] p-3">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> If you&apos;ve already printed this
                    QR code, it will automatically redirect to the new URL. No
                    need to reprint!
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-[15px] font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--border)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !newUrl.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] disabled:translate-y-0 disabled:bg-[var(--muted)] disabled:opacity-70"
                >
                  {saving ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="h-[18px] w-[18px]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Upgrade Mode UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,26,26,0.6)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-[480px] overflow-hidden rounded-[20px] bg-[var(--bg)] shadow-2xl duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] transition-colors hover:bg-[var(--border)]"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px] text-[var(--muted)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-light)]">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-10 w-10 text-[var(--accent)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-serif text-2xl text-[var(--fg)]">
            Unlock Editing
          </h2>
          <p className="text-[15px] text-[var(--muted)]">
            Make this QR code editable forever
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* QR Info Row */}
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-[var(--surface)] p-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white">
              {qrPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrPreview} alt="QR preview" className="h-11 w-11" />
              ) : (
                <div className="h-11 w-11 animate-pulse rounded bg-[var(--border)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[var(--fg)]">
                {qrCode.title}
              </div>
              <div className="truncate text-xs text-[var(--muted)]">
                {qrCode.destination_url}
              </div>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {/* Single QR Option */}
            <button
              onClick={() => setSelectedPlan("single")}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedPlan === "single"
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
              }`}
            >
              {selectedPlan === "single" && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-3 w-3 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <div className="font-serif text-2xl text-[var(--fg)]">$3.99</div>
              <div className="mt-1 text-xs font-semibold text-[var(--fg)]">
                This QR Only
              </div>
              <div className="mt-1 text-[10px] text-[var(--muted)]">
                Edit this QR code forever
              </div>
            </button>

            {/* Unlimited Option */}
            <button
              onClick={() => setSelectedPlan("unlimited")}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedPlan === "unlimited"
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
              }`}
            >
              <div className="absolute -top-2 left-3 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                Best Value
              </div>
              {selectedPlan === "unlimited" && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-3 w-3 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <div className="font-serif text-2xl text-[var(--fg)]">$9.99</div>
              <div className="mt-1 text-xs font-semibold text-[var(--fg)]">
                Unlimited QRs
              </div>
              <div className="mt-1 text-[10px] text-[var(--muted)]">
                Edit all QR codes forever
              </div>
            </button>
          </div>

          {/* Feature List */}
          <div className="mb-4 rounded-xl bg-[var(--surface)] p-4">
            {[
              {
                title: selectedPlan === "unlimited" ? "All QR codes editable" : "Edit this QR forever",
                desc: "Change the destination URL anytime",
              },
              { title: "No expiration", desc: "Your QR code works forever" },
              {
                title: "Scan analytics",
                desc: "Track who scans your code",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`flex items-start gap-3 py-2 ${i !== 2 ? "mb-1 border-b border-[var(--border)] pb-2" : ""}`}
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d1e7dd]">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-3 w-3 text-[#198754]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-xs text-[var(--fg)]">
                  <strong>{feature.title}</strong> - {feature.desc}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={() => handleUpgrade()}
            disabled={processingPayment}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] hover:shadow-lg disabled:translate-y-0 disabled:opacity-70"
          >
            {processingPayment ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Pay {selectedPlan === "unlimited" ? "$9.99" : "$3.99"} &amp; Unlock
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Secure payment via Stripe
          </div>

          <button
            onClick={onClose}
            className="mt-4 block w-full text-center text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
