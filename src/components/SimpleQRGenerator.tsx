"use client";

import { useState, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/AuthModal";

// Generate a random 8-character alphanumeric code
function generateShortCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Extract a title from content
function extractTitleFromContent(content: string): string {
  // Handle special protocols
  if (content.startsWith("mailto:")) {
    const email = content.replace("mailto:", "").split("?")[0];
    return `Email: ${email}`;
  }
  if (content.startsWith("tel:")) {
    const phone = content.replace("tel:", "");
    return `Phone: ${phone}`;
  }
  if (content.startsWith("sms:")) {
    const phone = content.replace("sms:", "").split("?")[0];
    return `SMS: ${phone}`;
  }
  if (content.toUpperCase().startsWith("WIFI:")) {
    // Parse SSID from WIFI format: WIFI:T:WPA;S:NetworkName;P:Password;;
    const ssidMatch = content.match(/S:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : "Network";
    return `WiFi: ${ssid}`;
  }
  if (content.startsWith("BEGIN:VCARD")) {
    // Parse name from vCard
    const nameMatch = content.match(/FN:([^\r\n]+)/);
    const name = nameMatch ? nameMatch[1] : "Contact";
    return `vCard: ${name}`;
  }
  if (content.startsWith("geo:")) {
    return "Location QR";
  }

  // Handle regular URLs
  try {
    const urlObj = new URL(content);
    const hostname = urlObj.hostname.replace(/^www\./, "");
    return `${hostname} QR`;
  } catch {
    return "QR Code";
  }
}

export default function SimpleQRGenerator() {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [savedQrId, setSavedQrId] = useState<string | null>(null);

  // Generate QR code when URL changes (with debounce)
  const generateQR = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setQrDataUrl(null);
      return;
    }

    // Process URL - only add https:// if it's not a special protocol
    let processedUrl = inputUrl.trim();
    const specialProtocols = [
      "http://",
      "https://",
      "mailto:",
      "tel:",
      "sms:",
      "WIFI:",
      "wifi:",
      "BEGIN:",
      "geo:",
    ];
    const hasProtocol = specialProtocols.some((protocol) =>
      processedUrl.startsWith(protocol)
    );
    if (!hasProtocol) {
      processedUrl = "https://" + processedUrl;
    }

    setIsGenerating(true);

    try {
      const dataUrl = await QRCode.toDataURL(processedUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
      trackEvent.qrGenerated("simple");
    } catch {
      // Silent fail for invalid URLs
      setQrDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Debounced URL change handler
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR(url);
    }, 300);
    return () => clearTimeout(timer);
  }, [url, generateQR]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      generateQR(url);
    }
  };

  const downloadPNG = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackEvent.qrDownloaded("png", "simple");
  }, [qrDataUrl]);

  // Save QR code to database
  const saveQRCode = useCallback(async () => {
    if (!qrDataUrl || !url.trim()) return;

    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Show auth modal if not authenticated
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    // Process URL - only add https:// if it's not a special protocol
    let processedUrl = url.trim();
    const specialProtocols = [
      "http://",
      "https://",
      "mailto:",
      "tel:",
      "sms:",
      "WIFI:",
      "wifi:",
      "BEGIN:",
      "geo:",
    ];
    const hasProtocol = specialProtocols.some((protocol) =>
      processedUrl.startsWith(protocol)
    );
    if (!hasProtocol) {
      processedUrl = "https://" + processedUrl;
    }

    // Generate title from URL
    const title = extractTitleFromContent(processedUrl);

    // Try to insert with retry for duplicate short_code
    let retries = 3;
    while (retries > 0) {
      const shortCode = generateShortCode();

      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          user_id: session.user.id,
          title,
          short_code: shortCode,
          destination_url: processedUrl,
          is_editable: false,
          scan_count: 0,
        })
        .select("id")
        .single();

      if (error) {
        // Check if it's a duplicate short_code error
        if (error.code === "23505" && error.message.includes("short_code")) {
          retries--;
          continue;
        }
        // Other error
        setSaveStatus({
          type: "error",
          message: error.message || "Failed to save QR code",
        });
        trackEvent.error("qr_save_failed", error.message);
        setIsSaving(false);
        return;
      }

      // Success
      setSavedQrId(data.id);
      setSaveStatus({
        type: "success",
        message: "QR code saved! View in dashboard",
      });
      trackEvent.qrGenerated("simple");
      setIsSaving(false);
      return;
    }

    // All retries exhausted
    setSaveStatus({
      type: "error",
      message: "Failed to generate unique code. Please try again.",
    });
    setIsSaving(false);
  }, [qrDataUrl, url]);

  // Listen for auth state changes to auto-save after login
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && showAuthModal) {
        setShowAuthModal(false);
        // Auto-save after successful sign in
        saveQRCode();
      }
    });

    return () => subscription.unsubscribe();
  }, [showAuthModal, saveQRCode]);

  const moreOptionsUrl = url.trim()
    ? `/generator?url=${encodeURIComponent(url.trim())}`
    : "/generator";

  return (
    <div className="bg-surface p-8" role="form" aria-label="QR Code Generator">
      {/* URL Input Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label
              htmlFor="url-input"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted"
            >
              Enter URL
            </label>
            <input
              id="url-input"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://yoursite.com"
              className="w-full border-b-2 border-border bg-transparent py-3 font-serif text-xl italic text-fg outline-none transition-colors placeholder:italic placeholder:text-muted focus:border-accent"
            />
          </div>
          <Link
            href={moreOptionsUrl}
            onClick={() => trackEvent.moreButtonClicked("simple-generator")}
            className="flex items-center gap-1 whitespace-nowrap text-[13px] text-muted transition-colors hover:text-accent"
          >
            More options
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* QR Preview Section */}
      <div
        className={`mb-6 flex items-center justify-center border bg-white p-8 ${
          qrDataUrl ? "border-border" : "border-dashed border-border bg-surface"
        }`}
      >
        {qrDataUrl ? (
          <div className="h-[180px] w-[180px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Generated QR code"
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-[180px] w-[180px] items-center justify-center bg-surface">
            {isGenerating ? (
              <div className="animate-pulse">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="h-20 w-20 text-border"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="4" height="4" />
                  <rect x="17" y="17" width="4" height="4" />
                </svg>
              </div>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="h-20 w-20 text-border"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="4" height="4" />
                <rect x="17" y="17" width="4" height="4" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Empty state hint */}
      {!qrDataUrl && !isGenerating && (
        <p className="mb-6 text-center text-[13px] italic text-muted">
          Enter a URL above to generate your QR code
        </p>
      )}

      {/* Actions Section */}
      {qrDataUrl && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={downloadPNG}
              className="flex flex-1 items-center justify-center gap-2 bg-fg px-6 py-4 text-[15px] font-semibold text-bg transition-colors hover:bg-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-[18px] w-[18px]"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download PNG
            </button>
            {savedQrId ? (
              <Link
                href="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 border-2 border-green-600 bg-green-50 px-6 py-4 text-[15px] font-semibold text-green-700 transition-colors hover:bg-green-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                View in Dashboard
              </Link>
            ) : (
              <button
                onClick={saveQRCode}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-fg bg-transparent px-6 py-4 text-[15px] font-semibold text-fg transition-colors hover:bg-fg hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isSaving ? "Saving..." : "Save QR Code"}
              </button>
            )}
          </div>

          {/* Save status message */}
          {saveStatus && !savedQrId && (
            <div
              className={`rounded border p-3 text-center text-sm ${
                saveStatus.type === "success"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-red-600 bg-red-50 text-red-800"
              }`}
            >
              {saveStatus.message}
            </div>
          )}

          <Link
            href={moreOptionsUrl}
            onClick={() => trackEvent.moreButtonClicked("simple-generator")}
            className="flex items-center justify-center gap-1 text-[13px] text-muted transition-colors hover:text-accent"
          >
            More options
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
