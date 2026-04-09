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
  foreground_color?: string;
  background_color?: string;
  pattern_style?: string;
  size?: number;
  format?: string;
}

interface EditModalProps {
  qrCode: QRCodeData;
  onClose: () => void;
  onUpdate: (newUrl: string) => void;
  forceRefresh?: boolean;
}

type TabType = "content" | "style" | "format" | "analytics";

export default function EditModal({
  qrCode,
  onClose,
  onUpdate,
  forceRefresh = false,
}: EditModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isEditable, setIsEditable] = useState(qrCode.is_editable);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Style settings
  const [foregroundColor, setForegroundColor] = useState(
    qrCode.foreground_color || "#1a1a1a"
  );
  const [backgroundColor, setBackgroundColor] = useState(
    qrCode.background_color || "#ffffff"
  );
  const [patternStyle, setPatternStyle] = useState(
    qrCode.pattern_style || "square"
  );

  // Format settings
  const [size, setSize] = useState(qrCode.size || 1024);
  const [format, setFormat] = useState<"png" | "svg">(
    (qrCode.format as "png" | "svg") || "png"
  );

  const supabase = createClient();

  // Check if user can edit content - directly check is_editable on QR code
  const canEditContent = isEditable;

  // Fetch QR code editable status (in case it was updated via payment)
  // Payment success page updates is_editable immediately, so no polling needed
  useEffect(() => {
    async function fetchQRStatus() {
      setLoadingProfile(true);

      // Re-fetch the QR code to check if it's editable
      // Use a cache-busting approach to ensure fresh data
      const { data: qrData, error } = await supabase
        .from("qr_codes")
        .select("is_editable")
        .eq("id", qrCode.id)
        .single();

      if (error) {
        console.error("Error fetching QR status:", error);
        // Still use the prop value if fetch fails
        setIsEditable(qrCode.is_editable);
      } else if (qrData) {
        setIsEditable(qrData.is_editable);
      }

      setLoadingProfile(false);
    }

    fetchQRStatus();
  }, [supabase, qrCode.id, qrCode.is_editable, forceRefresh]);

  // Generate QR preview
  useEffect(() => {
    QRCode.toDataURL(qrCode.destination_url, {
      width: 200,
      margin: 1,
      color: { dark: foregroundColor, light: backgroundColor },
    }).then(setQrPreview);
  }, [qrCode.destination_url, foregroundColor, backgroundColor]);

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

  const handleSaveContent = async () => {
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

  const handleSaveStyle = async () => {
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        foreground_color: foregroundColor,
        background_color: backgroundColor,
        pattern_style: patternStyle,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCode.id);

    if (updateError) {
      console.error("Error updating QR style:", updateError);
      setError("Failed to update style. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSaving(false);
    }, 1500);
  };

  const handleSaveFormat = async () => {
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        size: size,
        format: format,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCode.id);

    if (updateError) {
      console.error("Error updating QR format:", updateError);
      setError("Failed to update format. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSaving(false);
    }, 1500);
  };

  const handleUnlock = async () => {
    setProcessingPayment(true);

    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE;

      // Call checkout API with QR code ID
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

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: "content",
      label: "Content",
      icon: (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      id: "style",
      label: "Style",
      icon: (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
    },
    {
      id: "format",
      label: "Format",
      icon: (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  // Content Tab - Locked State (single $1.99 paywall)
  const renderLockedContent = () => (
    <div className="p-4 sm:p-6">
      {/* QR Info Row */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-[var(--surface)] p-3 sm:mb-6 sm:gap-4 sm:p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white sm:h-14 sm:w-14">
          {qrPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrPreview}
              alt="QR preview"
              className="h-9 w-9 sm:h-11 sm:w-11"
            />
          ) : (
            <div className="h-9 w-9 animate-pulse rounded bg-[var(--border)] sm:h-11 sm:w-11" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[var(--fg)] sm:text-base">
            {qrCode.title}
          </div>
          <div className="truncate text-xs text-[var(--muted)]">
            theqrspot.com/r/{qrCode.short_code}
          </div>
        </div>
      </div>

      {/* Lock Message */}
      <div className="mb-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center sm:mb-6 sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-light)]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[var(--accent)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-serif text-lg text-[var(--fg)] sm:text-xl">
          Unlock Editing and Analytics
        </h3>
        <p className="mb-3 text-sm text-[var(--muted)] sm:mb-4">
          Change where this QR code redirects and view scan analytics.
        </p>

        {/* Current URL */}
        <div className="rounded-lg bg-white p-3 text-left">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:text-[11px]">
            Current destination
          </div>
          <div className="mt-1 break-all text-sm text-[var(--fg)]">
            {qrCode.destination_url}
          </div>
        </div>
      </div>

      {/* Single $1.99 Pricing */}
      <div className="mb-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-light)] p-4 text-center sm:mb-6 sm:p-6">
        <div className="font-serif text-3xl text-[var(--fg)] sm:text-4xl">
          $1.99
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--fg)]">
          One-time payment
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          Unlock editing and analytics for this QR code forever
        </div>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      {/* Unlock Button */}
      <button
        onClick={handleUnlock}
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
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            Unlock for $1.99
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
    </div>
  );

  // Content Tab - Editable State
  const renderEditableContent = () => {
    if (success) {
      return (
        <div className="p-6 text-center sm:p-8">
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
      );
    }

    return (
      <div className="p-4 sm:p-6">
        {/* QR Info Row */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-[var(--surface)] p-3 sm:mb-6 sm:gap-4 sm:p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white sm:h-14 sm:w-14">
            {qrPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrPreview}
                alt="QR preview"
                className="h-9 w-9 sm:h-11 sm:w-11"
              />
            ) : (
              <div className="h-9 w-9 animate-pulse rounded bg-[var(--border)] sm:h-11 sm:w-11" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[var(--fg)] sm:text-base">
              {qrCode.title}
            </div>
            <div className="truncate text-xs text-[var(--muted)]">
              theqrspot.com/r/{qrCode.short_code}
            </div>
          </div>
        </div>

        {/* Current URL */}
        <div className="mb-4 rounded-lg bg-[var(--surface)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:text-[11px]">
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
            className={`w-full rounded-xl border bg-white px-4 py-4 text-base transition-all focus:outline-none sm:py-3.5 sm:text-[15px] ${
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
            <strong>Note:</strong> If you&apos;ve already printed this QR code,
            it will automatically redirect to the new URL. No need to reprint!
          </p>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="order-2 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 text-base font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--border)] sm:order-1 sm:py-3.5 sm:text-[15px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveContent}
            disabled={saving || !newUrl.trim()}
            className="order-1 flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] disabled:translate-y-0 disabled:bg-[var(--muted)] disabled:opacity-70 sm:order-2 sm:py-3.5 sm:text-[15px]"
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
      </div>
    );
  };

  // Style Tab
  const renderStyleTab = () => (
    <div className="p-4 sm:p-6">
      {/* QR Preview */}
      <div className="mb-6 flex justify-center">
        <div
          className="flex h-40 w-40 items-center justify-center rounded-xl"
          style={{ backgroundColor: backgroundColor }}
        >
          {qrPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrPreview} alt="QR preview" className="h-32 w-32" />
          ) : (
            <div className="h-32 w-32 animate-pulse rounded bg-[var(--border)]" />
          )}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
          Foreground Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-[var(--border)]"
          />
          <input
            type="text"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm uppercase"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
          Background Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-[var(--border)]"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm uppercase"
          />
        </div>
      </div>

      {/* Pattern Style */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
          Pattern Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["square", "rounded", "dots"].map((style) => (
            <button
              key={style}
              onClick={() => setPatternStyle(style)}
              className={`rounded-lg border-2 px-4 py-2 text-sm capitalize transition-all ${
                patternStyle === style
                  ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-white text-[var(--fg)] hover:border-[var(--accent)]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      {success && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-[#d1e7dd] p-3 text-sm text-[#198754]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Style saved!
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveStyle}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] disabled:translate-y-0 disabled:opacity-70 sm:py-3.5 sm:text-[15px]"
      >
        {saving ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          "Save Style"
        )}
      </button>
    </div>
  );

  // Format Tab
  const renderFormatTab = () => (
    <div className="p-4 sm:p-6">
      {/* Size Selection */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
          Size (pixels)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[256, 512, 1024, 2048].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                size === s
                  ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-white text-[var(--fg)] hover:border-[var(--accent)]"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormat("png")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
              format === "png"
                ? "border-[var(--accent)] bg-[var(--accent-light)]"
                : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
            }`}
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-semibold">PNG</span>
          </button>
          <button
            onClick={() => setFormat("svg")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
              format === "svg"
                ? "border-[var(--accent)] bg-[var(--accent-light)]"
                : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
            }`}
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span className="font-semibold">SVG</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          PNG is best for printing. SVG is scalable for any size.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      {success && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-[#d1e7dd] p-3 text-sm text-[#198754]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Format saved!
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveFormat}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] disabled:translate-y-0 disabled:opacity-70 sm:py-3.5 sm:text-[15px]"
      >
        {saving ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          "Save Format"
        )}
      </button>
    </div>
  );

  // Analytics Tab - Locked State (single $1.99 paywall)
  const renderLockedAnalytics = () => (
    <div className="p-4 sm:p-6">
      {/* QR Info Row */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-[var(--surface)] p-3 sm:mb-6 sm:gap-4 sm:p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white sm:h-14 sm:w-14">
          {qrPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrPreview}
              alt="QR preview"
              className="h-9 w-9 sm:h-11 sm:w-11"
            />
          ) : (
            <div className="h-9 w-9 animate-pulse rounded bg-[var(--border)] sm:h-11 sm:w-11" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[var(--fg)] sm:text-base">
            {qrCode.title}
          </div>
          <div className="truncate text-xs text-[var(--muted)]">
            theqrspot.com/r/{qrCode.short_code}
          </div>
        </div>
      </div>

      {/* Lock Message */}
      <div className="mb-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center sm:mb-6 sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-light)]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[var(--accent)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-serif text-lg text-[var(--fg)] sm:text-xl">
          Unlock Editing and Analytics
        </h3>
        <p className="mb-3 text-sm text-[var(--muted)] sm:mb-4">
          View detailed scan analytics including total scans, weekly trends, and
          more.
        </p>
      </div>

      {/* Single $1.99 Pricing */}
      <div className="mb-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-light)] p-4 text-center sm:mb-6 sm:p-6">
        <div className="font-serif text-3xl text-[var(--fg)] sm:text-4xl">
          $1.99
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--fg)]">
          One-time payment
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          Unlock editing and analytics for this QR code forever
        </div>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      {/* Unlock Button */}
      <button
        onClick={handleUnlock}
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
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            Unlock for $1.99
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
    </div>
  );

  // Analytics Tab - Unlocked State (for paid users)
  const renderAnalyticsTab = () => (
    <div className="p-4 sm:p-6">
      {/* Coming Soon / Basic Stats */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)]">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[var(--muted)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-serif text-lg text-[var(--fg)]">
          Scan Analytics
        </h3>
        <p className="mb-6 text-sm text-[var(--muted)]">
          View detailed analytics on the QR code detail page.
        </p>

        {/* Quick Stats */}
        <div className="rounded-xl bg-[var(--surface)] p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="font-serif text-3xl text-[var(--fg)]">0</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Total Scans
              </div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl text-[var(--fg)]">-</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                This Week
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Analytics are updated in real-time as your QR code is scanned.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        if (loadingProfile) {
          return (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
            </div>
          );
        }
        return canEditContent ? renderEditableContent() : renderLockedContent();
      case "style":
        return renderStyleTab();
      case "format":
        return renderFormatTab();
      case "analytics":
        if (loadingProfile) {
          return (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
            </div>
          );
        }
        return canEditContent ? renderAnalyticsTab() : renderLockedAnalytics();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,26,26,0.6)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Full height on mobile, centered on desktop */}
      <div className="animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 relative flex h-[95vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-[var(--bg)] shadow-2xl duration-200 sm:h-auto sm:max-h-[90vh] sm:max-w-[520px] sm:rounded-[20px]">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-6 sm:py-4">
          {/* Mobile drag indicator */}
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--border)] sm:hidden" />
          <h2 className="font-serif text-lg text-[var(--fg)] sm:text-xl">
            Edit QR Code
          </h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] transition-colors hover:bg-[var(--border)] sm:h-8 sm:w-8"
            aria-label="Close modal"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-[var(--muted)] sm:h-[18px] sm:w-[18px]"
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

        {/* Tabs - Horizontal layout on mobile with smaller icons and text */}
        <div className="flex flex-shrink-0 border-b border-[var(--border)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 min-w-0 flex-row items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-medium transition-all whitespace-nowrap sm:gap-2 sm:px-4 sm:text-sm ${
                activeTab === tab.id
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
