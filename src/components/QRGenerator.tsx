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

  // Customization options
  const [fgColor, setFgColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(400);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");

  // Custom text for printable page
  const [customTitle, setCustomTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");

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
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
      setQrDataUrl(dataUrl);
      setGeneratedUrl(processedUrl);

      // Generate SVG for SVG download
      const svgString = await QRCode.toString(processedUrl, {
        type: "svg",
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
      setQrSvg(svgString);
    } catch {
      setError("Failed to generate QR code. Please check the URL.");
    } finally {
      setIsGenerating(false);
    }
  }, [url, size, fgColor, bgColor, errorLevel]);

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
            <title>Print QR Code - The QR Spot</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 40px;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }
              .container {
                text-align: center;
                max-width: 600px;
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 12px;
              }
              .message {
                font-size: 16px;
                color: #666;
                margin-bottom: 32px;
                line-height: 1.5;
              }
              img {
                max-width: 400px;
                height: auto;
                margin: 0 auto;
              }
              @media print {
                body {
                  padding: 20px;
                }
                .title {
                  margin-bottom: 8px;
                }
                .message {
                  margin-bottom: 24px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              ${customTitle ? `<div class="title">${customTitle}</div>` : ''}
              ${customMessage ? `<div class="message">${customMessage}</div>` : ''}
              <img src="${qrDataUrl}" alt="QR Code for ${generatedUrl}" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [qrDataUrl, generatedUrl, customTitle, customMessage]);

  return (
    <div
      className="relative bg-surface"
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

      {/* Split Layout: Controls Left | Preview Right */}
      <div className="grid gap-0 md:grid-cols-[1fr_320px]">
        {/* Left Panel: Controls */}
        <div className="border-r border-border p-8 md:p-12">
          {/* URL Input */}
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

          {/* Customization Options - Always Visible */}
          <div className="space-y-8">
            {/* Custom Text Section */}
            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
                Printable Page Text
              </h3>

              {/* Title Input */}
              <div>
                <label
                  htmlFor="custom-title"
                  className="mb-2 block text-xs uppercase tracking-wider text-muted"
                >
                  Title (Optional)
                </label>
                <input
                  type="text"
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Visit Our Website"
                  className="w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>

              {/* Message Input */}
              <div>
                <label
                  htmlFor="custom-message"
                  className="mb-2 block text-xs uppercase tracking-wider text-muted"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g., Scan this QR code to access our menu"
                  rows={3}
                  className="w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* QR Code Customization */}
            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
                QR Code Appearance
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Foreground Color */}
                <div>
                  <label
                    htmlFor="fg-color"
                    className="mb-2 block text-xs uppercase tracking-wider text-muted"
                  >
                    Foreground Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="fg-color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-12 w-16 cursor-pointer rounded border border-border"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label
                    htmlFor="bg-color"
                    className="mb-2 block text-xs uppercase tracking-wider text-muted"
                  >
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="bg-color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-12 w-16 cursor-pointer rounded border border-border"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <label
                  htmlFor="qr-size"
                  className="mb-2 block text-xs uppercase tracking-wider text-muted"
                >
                  Size: {size}px
                </label>
                <input
                  type="range"
                  id="qr-size"
                  min="200"
                  max="1000"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>200px</span>
                  <span>1000px</span>
                </div>
              </div>

              {/* Error Correction Level */}
              <div>
                <label
                  htmlFor="error-level"
                  className="mb-2 block text-xs uppercase tracking-wider text-muted"
                >
                  Error Correction
                </label>
                <select
                  id="error-level"
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
                  className="w-full border border-border bg-white px-3 py-2 outline-none focus:border-accent"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

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

            {/* Note */}
            <p className="mt-6 text-center text-sm italic text-muted">
              Free to generate. Save to dashboard for editing capabilities.
            </p>
          </div>
        </div>

        {/* Right Panel: Sticky Preview */}
        <div className="sticky top-0 flex min-h-[600px] flex-col items-center justify-center bg-white p-8"
          role="region"
          aria-label="QR Code Preview"
        >
          {qrDataUrl ? (
            <>
              {/* QR Code Preview with Custom Text */}
              {customTitle && (
                <h3 className="mb-3 text-center text-xl font-semibold text-fg">
                  {customTitle}
                </h3>
              )}
              {customMessage && (
                <p className="mb-6 max-w-md text-center text-sm text-muted">
                  {customMessage}
                </p>
              )}

              {/* QR Code Image */}
              <div className="mb-6 border border-border bg-white p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR code linking to ${generatedUrl}`}
                  className="h-48 w-48"
                  width={192}
                  height={192}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex w-full max-w-[240px] flex-col gap-3">
                <button
                  onClick={downloadPNG}
                  className="flex items-center justify-center gap-2 bg-fg px-4 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
                  Download PNG
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={downloadSVG}
                    className="flex flex-1 items-center justify-center gap-2 border border-border bg-white px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
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
                    className="flex flex-1 items-center justify-center gap-2 border border-border bg-white px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
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
            </>
          ) : (
            <div className="text-center text-sm text-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto mb-4 h-16 w-16 opacity-30"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              <p>Enter a URL and click Generate to see your QR code</p>
            </div>
          )}
        </div>
      </div>

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
