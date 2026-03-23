"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const generateQR = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    let processedUrl = url.trim();
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate QR code as data URL for display and PNG download
      const dataUrl = await QRCode.toDataURL(processedUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
      setGeneratedUrl(processedUrl);

      // Generate SVG for SVG download
      const svgString = await QRCode.toString(processedUrl, {
        type: "svg",
        width: 400,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrSvg(svgString);
    } catch {
      setError("Failed to generate QR code. Please check the URL.");
    } finally {
      setIsGenerating(false);
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      generateQR();
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
  }, [qrDataUrl]);

  const downloadSVG = useCallback(() => {
    if (!qrSvg) return;

    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [qrSvg]);

  const printQR = useCallback(() => {
    if (!qrDataUrl) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Print QR Code - OneQR</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <img src="${qrDataUrl}" alt="QR Code for ${generatedUrl}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [qrDataUrl, generatedUrl]);

  return (
    <div
      className="relative bg-surface p-8 md:p-12"
      role="form"
      aria-label="QR Code Generator"
    >
      {/* "TRY IT NOW" label */}
      <div
        className="absolute -top-3 left-8 bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
        aria-hidden="true"
      >
        Try it now
      </div>

      {/* Input Section */}
      <div className="mb-8">
        <label
          htmlFor="qr-url-input"
          className="mb-4 block text-xs uppercase tracking-widest text-muted"
        >
          Enter Your URL
        </label>
        <input
          id="qr-url-input"
          type="url"
          inputMode="url"
          autoComplete="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://yoursite.com"
          className="w-full border-b-2 border-border bg-transparent pb-5 pt-2 font-serif text-xl text-fg outline-none transition-colors placeholder:italic placeholder:text-muted focus:border-accent md:text-2xl"
          aria-describedby={error ? "qr-error" : undefined}
          aria-invalid={error ? "true" : "false"}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p
          id="qr-error"
          className="mb-4 text-sm font-medium text-accent"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Generate Button */}
      <button
        onClick={generateQR}
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-3 bg-fg px-8 py-5 text-base font-semibold text-bg transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="sr-only">Generating QR code, please wait</span>
            <span aria-hidden="true">Generating...</span>
          </>
        ) : (
          <>
            Generate QR Code
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      {/* QR Code Display */}
      {qrDataUrl && (
        <div className="mt-8" role="region" aria-label="Generated QR Code">
          {/* QR Code Image - using img for data URL which can't be optimized by Next.js Image */}
          <figure className="mb-6 flex justify-center rounded-none border border-border bg-white p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR code linking to ${generatedUrl}`}
              className="h-48 w-48 md:h-56 md:w-56"
              width={224}
              height={224}
            />
          </figure>

          {/* Action Buttons */}
          <div
            className="grid grid-cols-3 gap-3"
            role="group"
            aria-label="Download and print options"
          >
            <button
              onClick={downloadPNG}
              className="flex items-center justify-center gap-2 border border-border bg-transparent px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Download QR code as PNG image"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              PNG
            </button>
            <button
              onClick={downloadSVG}
              className="flex items-center justify-center gap-2 border border-border bg-transparent px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Download QR code as SVG vector"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              SVG
            </button>
            <button
              onClick={printQR}
              className="flex items-center justify-center gap-2 border border-border bg-transparent px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Print QR code"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>
      )}

      {/* Note */}
      <p className="mt-6 text-center text-sm italic text-muted">
        Free to generate. Save to dashboard for editing capabilities.
      </p>

      {/* Hidden canvas for potential future use */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <iframe
        ref={printFrameRef}
        className="hidden"
        title="Print Frame"
        aria-hidden="true"
      />
    </div>
  );
}
