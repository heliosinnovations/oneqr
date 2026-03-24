"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";

type TabType = "colors" | "logo" | "settings";
type ErrorLevelType = "L" | "M" | "Q" | "H";

// Preset colors
const FG_PRESETS = [
  { color: "#000000", name: "Black" },
  { color: "#1E40AF", name: "Blue" },
  { color: "#047857", name: "Teal" },
  { color: "#7C3AED", name: "Purple" },
  { color: "#DC2626", name: "Red" },
];

const BG_PRESETS = [
  { color: "#FFFFFF", name: "White" },
  { color: "#F3F4F6", name: "Gray" },
  { color: "#FEF3C7", name: "Cream" },
  { color: "#DDD6FE", name: "Lavender" },
  { color: "#A7F3D0", name: "Mint" },
];

const SIZE_OPTIONS = [
  { value: 400, label: "Small", display: "400×400px" },
  { value: 512, label: "Medium", display: "512×512px" },
  { value: 1024, label: "Large", display: "1024×1024px" },
];

const ERROR_LEVELS: {
  value: ErrorLevelType;
  label: string;
  recovery: string;
  percentage: number;
}[] = [
  { value: "L", label: "L", recovery: "7% recovery", percentage: 25 },
  { value: "M", label: "M", recovery: "15% recovery", percentage: 50 },
  { value: "Q", label: "Q", recovery: "25% recovery", percentage: 75 },
  { value: "H", label: "H", recovery: "30% recovery", percentage: 100 },
];

export default function QRGenerator() {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("colors");

  // Customization options
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [size, setSize] = useState(512);
  const [errorLevel, setErrorLevel] = useState<ErrorLevelType>("M");

  // Logo state
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Updating badge animation
  const [isUpdating, setIsUpdating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR with optional logo overlay
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
    setIsUpdating(true);
    setError(null);

    try {
      // Generate base QR code
      const baseDataUrl = await QRCode.toDataURL(processedUrl, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });

      // If there's a logo, overlay it on the QR code
      if (logoDataUrl) {
        const finalDataUrl = await overlayLogoOnQR(
          baseDataUrl,
          logoDataUrl,
          size
        );
        setQrDataUrl(finalDataUrl);
      } else {
        setQrDataUrl(baseDataUrl);
      }

      setGeneratedUrl(processedUrl);
    } catch {
      setError("Failed to generate QR code. Please check the URL.");
    } finally {
      setIsGenerating(false);
      // Keep updating badge visible briefly
      setTimeout(() => setIsUpdating(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, size, fgColor, bgColor, errorLevel, logoDataUrl]);

  // Overlay logo on QR code using canvas
  const overlayLogoOnQR = async (
    qrDataUrl: string,
    logoUrl: string,
    qrSize: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = qrSize;
      canvas.height = qrSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

        // Load and draw logo
        const logoImage = new Image();
        logoImage.onload = () => {
          // Logo size is ~22% of QR size
          const logoSize = Math.round(qrSize * 0.22);
          const logoX = (qrSize - logoSize) / 2;
          const logoY = (qrSize - logoSize) / 2;

          // Draw white background for logo with small padding
          const padding = 4;
          ctx.fillStyle = bgColor;
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2
          );

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

          resolve(canvas.toDataURL("image/png"));
        };
        logoImage.onerror = () => reject(new Error("Failed to load logo"));
        logoImage.src = logoUrl;
      };
      qrImage.onerror = () => reject(new Error("Failed to load QR"));
      qrImage.src = qrDataUrl;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      generateQR();
    }
  };

  // Handle logo file upload
  const handleLogoUpload = useCallback((file: File) => {
    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload PNG, JPG, or SVG.");
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 2MB.");
      return;
    }

    setError(null);

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoDataUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  // Auto-regenerate QR when customization options change (only if QR already exists)
  useEffect(() => {
    if (generatedUrl && qrDataUrl) {
      generateQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fgColor, bgColor, size, errorLevel, logoDataUrl]);

  // Tab icons
  const TabIcon = ({ type }: { type: TabType }) => {
    switch (type) {
      case "colors":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case "logo":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        );
      case "settings":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        );
    }
  };

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

      <div className="p-8 md:p-12">
        {/* URL Input */}
        <div className="mb-6">
          <label
            htmlFor="qr-url-input"
            className="mb-4 block text-xs font-semibold uppercase tracking-widest text-muted"
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

        {/* Tab Navigation */}
        <nav className="mb-6 flex border-b border-border" role="tablist">
          {(["colors", "logo", "settings"] as TabType[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              onClick={() => setActiveTab(tab)}
              className={`relative flex flex-1 flex-col items-center gap-2 px-3 py-4 transition-all hover:bg-accent-light ${
                activeTab === tab
                  ? "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : ""
              }`}
            >
              <span
                className={`transition-colors ${
                  activeTab === tab ? "text-accent" : "text-muted"
                }`}
              >
                <TabIcon type={tab} />
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab ? "text-fg" : "text-muted"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </nav>

        {/* Tab Panels */}
        {/* Colors Panel */}
        <div
          id="colors-panel"
          role="tabpanel"
          aria-labelledby="colors-tab"
          className={`${activeTab === "colors" ? "animate-fadeIn block" : "hidden"}`}
        >
          {/* Color Preview Strip */}
          <div className="mb-5 flex h-12 overflow-hidden border border-border">
            <div className="flex-1" style={{ backgroundColor: fgColor }} />
            <div className="flex-1" style={{ backgroundColor: bgColor }} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Foreground Color */}
            <div className="border border-border bg-white p-4">
              <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Foreground Color
              </label>
              <div className="mb-3 flex items-center gap-3">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer border-2 border-border p-0"
                />
                <input
                  type="text"
                  value={fgColor.toUpperCase()}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 border border-border px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-1.5">
                {FG_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setFgColor(preset.color)}
                    className="h-6 w-6 border border-border transition-transform hover:scale-110"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                    aria-label={`Set foreground to ${preset.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="border border-border bg-white p-4">
              <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Background Color
              </label>
              <div className="mb-3 flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer border-2 border-border p-0"
                />
                <input
                  type="text"
                  value={bgColor.toUpperCase()}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 border border-border px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-1.5">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setBgColor(preset.color)}
                    className="h-6 w-6 border border-border transition-transform hover:scale-110"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                    aria-label={`Set background to ${preset.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logo Panel */}
        <div
          id="logo-panel"
          role="tabpanel"
          aria-labelledby="logo-tab"
          className={`${activeTab === "logo" ? "animate-fadeIn block" : "hidden"}`}
        >
          {!logoDataUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="cursor-pointer border-2 border-dashed border-border bg-white p-10 text-center transition-all hover:border-accent hover:bg-accent-light"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6 text-muted"
                >
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mb-1 text-sm text-fg">
                <strong className="text-accent">Browse</strong> or drag & drop
              </p>
              <p className="text-xs text-muted">PNG, SVG, JPG - Max 2MB</p>
            </div>
          ) : (
            <div className="border border-border bg-white p-5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDataUrl}
                alt="Logo preview"
                className="mx-auto mb-4 h-20 w-20 object-contain"
              />
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-border bg-white px-4 py-2 text-xs font-medium transition-colors hover:border-fg"
                >
                  Change
                </button>
                <button
                  onClick={removeLogo}
                  className="border border-border bg-white px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:border-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload logo"
          />
        </div>

        {/* Settings Panel */}
        <div
          id="settings-panel"
          role="tabpanel"
          aria-labelledby="settings-tab"
          className={`${activeTab === "settings" ? "animate-fadeIn block" : "hidden"}`}
        >
          {/* Size Selection */}
          <div className="mb-6">
            <label className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Output Size
              <span
                className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-border text-[10px] font-semibold text-muted hover:bg-accent hover:text-white"
                title="Higher resolution for print, lower for web"
              >
                ?
              </span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSize(option.value)}
                  className={`border-2 bg-white p-4 text-center transition-all ${
                    size === option.value
                      ? "border-accent bg-accent-light"
                      : "border-border hover:border-fg"
                  }`}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center">
                    <svg
                      className={`${
                        size === option.value ? "text-accent" : "text-muted"
                      }`}
                      width={
                        option.value === 400
                          ? 20
                          : option.value === 512
                            ? 28
                            : 36
                      }
                      height={
                        option.value === 400
                          ? 20
                          : option.value === 512
                            ? 28
                            : 36
                      }
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div className="text-[13px] font-semibold text-fg">
                    {option.label}
                  </div>
                  <div className="text-[11px] text-muted">{option.display}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Correction */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Error Correction
              <span
                className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-border text-[10px] font-semibold text-muted hover:bg-accent hover:text-white"
                title="Higher levels allow QR to work even when partially damaged"
              >
                ?
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {ERROR_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setErrorLevel(level.value)}
                  className={`border-2 bg-white p-3 text-center transition-all ${
                    errorLevel === level.value
                      ? "border-accent bg-accent-light"
                      : "border-border hover:border-fg"
                  }`}
                >
                  <div
                    className={`mb-1 text-lg font-bold ${
                      errorLevel === level.value ? "text-accent" : "text-fg"
                    }`}
                  >
                    {level.label}
                  </div>
                  <div className="text-[10px] text-muted">{level.recovery}</div>
                  <div className="mt-2 h-1 overflow-hidden bg-border">
                    <div
                      className={`h-full transition-all ${
                        errorLevel === level.value ? "bg-accent" : "bg-muted"
                      }`}
                      style={{ width: `${level.percentage}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Live Preview
            </span>
            <span
              className={`flex items-center gap-1.5 bg-accent-light px-2 py-1 text-[10px] font-semibold text-accent transition-opacity ${
                isUpdating ? "opacity-100" : "opacity-50"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full bg-accent ${
                  isUpdating ? "animate-pulse" : ""
                }`}
              />
              Updating
            </span>
          </div>
          <div className="flex justify-center border border-border bg-white p-6">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code linking to ${generatedUrl}`}
                className="h-40 w-40"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center bg-surface">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="h-16 w-16 text-border"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="4" height="4" />
                  <rect x="17" y="17" width="4" height="4" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Generate & Download Button */}
        <button
          onClick={qrDataUrl ? downloadPNG : generateQR}
          disabled={isGenerating}
          className="mt-6 flex w-full items-center justify-center gap-3 bg-fg px-8 py-5 text-base font-semibold text-bg transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-busy={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="sr-only">Generating QR code, please wait</span>
              <span aria-hidden="true">Generating...</span>
            </>
          ) : qrDataUrl ? (
            <>
              Generate & Download
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
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
        <p className="mt-5 text-center text-sm italic text-muted">
          Free to generate. Save to dashboard for editing capabilities.
        </p>
      </div>

      {/* Hidden canvas for potential future use */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
}
