"use client";

import { useState, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function SimpleQRGenerator() {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code when URL changes (with debounce)
  const generateQR = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setQrDataUrl(null);
      return;
    }

    // Basic URL processing
    let processedUrl = inputUrl.trim();
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
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
      trackEvent.qrGenerated('simple');
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

    trackEvent.qrDownloaded('png', 'simple');
  }, [qrDataUrl]);

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
            onClick={() => trackEvent.moreButtonClicked('simple-generator')}
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
          <Link
            href={moreOptionsUrl}
            onClick={() => trackEvent.moreButtonClicked('simple-generator')}
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
      )}
    </div>
  );
}
