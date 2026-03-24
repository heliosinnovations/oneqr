"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import Link from "next/link";

type TabType = "content" | "colors" | "style" | "export";
type ToastType = { message: string; type: "success" | "error"; id: number };
type ErrorLevelType = "L" | "M" | "Q" | "H";
type PatternType = "square" | "rounded" | "dots" | "classy";
type CornerType = "square" | "rounded" | "extra" | "dot";
type FormatType = "png" | "svg" | "pdf";
type SizeType = 256 | 512 | 1024 | 2048;

// Preset colors
const COLOR_PRESETS = [
  { color: "#1a1a1a", name: "Black" },
  { color: "#2563eb", name: "Blue" },
  { color: "#059669", name: "Green" },
  { color: "#ff4d00", name: "Orange" },
];

// Quick action templates
const QUICK_ACTIONS = [
  { id: "website", icon: "globe", label: "Website", template: "https://" },
  {
    id: "wifi",
    icon: "wifi",
    label: "WiFi",
    template: "WIFI:T:WPA;S:NetworkName;P:Password;;",
  },
  {
    id: "vcard",
    icon: "user",
    label: "Contact",
    template: "BEGIN:VCARD\nVERSION:3.0\nFN:Name\nEND:VCARD",
  },
  {
    id: "email",
    icon: "mail",
    label: "Email",
    template: "mailto:email@example.com",
  },
  { id: "sms", icon: "message", label: "SMS", template: "sms:+1234567890" },
  {
    id: "location",
    icon: "map-pin",
    label: "Location",
    template: "geo:40.7128,-74.0060",
  },
];

const ERROR_LEVELS: {
  value: ErrorLevelType;
  label: string;
  percentage: string;
}[] = [
  { value: "L", label: "L", percentage: "7%" },
  { value: "M", label: "M", percentage: "15%" },
  { value: "Q", label: "Q", percentage: "25%" },
  { value: "H", label: "H", percentage: "30%" },
];

export default function GeneratorPage() {
  // Form state
  const [url, setUrl] = useState("https://example.com");
  const [urlValid, setUrlValid] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [zoomLevel, setZoomLevel] = useState(100);

  // Customization options
  const [fgColor, setFgColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [pattern, setPattern] = useState<PatternType>("square");
  const [cornerStyle, setCornerStyle] = useState<CornerType>("square");
  const [errorLevel, setErrorLevel] = useState<ErrorLevelType>("M");
  const [exportFormat, setExportFormat] = useState<FormatType>("png");
  const [exportSize, setExportSize] = useState<SizeType>(512);
  const [dpi, setDpi] = useState(150);

  // Toast state - support multiple toasts with IDs
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const toastIdRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debounce helper
  const debounce = <T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // URL validation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateURL = useCallback(
    debounce((value: string) => {
      if (!value.trim()) {
        setUrlValid(false);
        return;
      }
      try {
        new URL(value);
        setUrlValid(true);
      } catch {
        setUrlValid(false);
      }
    }, 300),
    []
  );

  // Show toast notification with slide-in animation and auto-dismiss
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { message, type, id }]);
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  // Generate QR code
  const generateQR = useCallback(async () => {
    if (!url.trim()) return;

    let processedUrl = url.trim();
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://") &&
      !processedUrl.startsWith("WIFI:") &&
      !processedUrl.startsWith("BEGIN:") &&
      !processedUrl.startsWith("mailto:") &&
      !processedUrl.startsWith("sms:") &&
      !processedUrl.startsWith("geo:")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    setIsGenerating(true);

    try {
      const dataUrl = await QRCode.toDataURL(processedUrl, {
        width: exportSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
      setQrDataUrl(dataUrl);
      setGeneratedUrl(processedUrl);
    } catch {
      showToast("Failed to generate QR code", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [url, exportSize, fgColor, bgColor, errorLevel, showToast]);

  // Handle template selection
  const setTemplate = (templateId: string) => {
    const template = QUICK_ACTIONS.find((a) => a.id === templateId);
    if (template) {
      setUrl(template.template);
      validateURL(template.template);
      showToast(`Template loaded: ${template.label}`, "success");
    }
  };

  // Handle color preset selection
  const selectColorPreset = (color: string) => {
    setFgColor(color);
  };

  // Validate and normalize hex color
  const isValidHex = (hex: string): boolean => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const normalizeHex = (hex: string): string => {
    let normalized = hex.startsWith("#") ? hex : `#${hex}`;
    // Expand 3-char hex to 6-char
    if (normalized.length === 4) {
      normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }
    return normalized.toLowerCase();
  };

  // Handle hex input change with validation
  const handleHexInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Allow user to type freely
    const cleanValue = value.toUpperCase();
    if (isValidHex(cleanValue)) {
      setter(normalizeHex(cleanValue));
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (zoomLevel < 200) setZoomLevel((z) => z + 25);
  };

  const zoomOut = () => {
    if (zoomLevel > 50) setZoomLevel((z) => z - 25);
  };

  const resetZoom = () => setZoomLevel(100);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Download QR code
  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-code.${exportFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR Code downloaded successfully!", "success");
  };

  // Calculate contrast ratio
  const getContrastRatio = (fg: string, bg: string): number => {
    const getLuminance = (hex: string): number => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return 0;
      const [r, g, b] = [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const wcagAA = contrastRatio >= 4.5;
  const wcagAAA = contrastRatio >= 7;

  // Auto-regenerate QR when options change (if QR already exists)
  useEffect(() => {
    // Only regenerate if we already have a QR code
    if (!generatedUrl || !qrDataUrl) return;

    // Regenerate QR with current colors/options
    const regenerate = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(generatedUrl, {
          width: exportSize,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorLevel,
        });
        setQrDataUrl(dataUrl);
      } catch {
        showToast("Failed to regenerate QR code", "error");
      } finally {
        setIsGenerating(false);
      }
    };

    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fgColor, bgColor, exportSize, errorLevel]);

  // Initial QR generation
  useEffect(() => {
    generateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (qrDataUrl) {
          const link = document.createElement("a");
          link.href = qrDataUrl;
          link.download = `qr-code.${exportFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast("QR Code downloaded successfully!", "success");
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [qrDataUrl, exportFormat, showToast]);

  // Icon components
  const Icon = ({
    name,
    className = "w-4 h-4",
  }: {
    name: string;
    className?: string;
  }) => {
    const icons: Record<string, JSX.Element> = {
      link: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      globe: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      wifi: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      ),
      user: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      mail: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      message: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
      "map-pin": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      check: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      x: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
      "chevron-right": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ),
      "more-horizontal": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      ),
      upload: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      download: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      copy: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      ),
      share: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
      "zoom-in": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
      "zoom-out": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
      "refresh-cw": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      ),
      qr: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      "check-circle": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      "alert-circle": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      "x-circle": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    };
    return icons[name] || null;
  };

  return (
    <div className="min-h-screen bg-[var(--pro-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--pro-border)] bg-[var(--pro-surface)]">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-2xl text-[var(--pro-fg)]">
              QR<span className="text-[var(--pro-accent)]">Spot</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm text-[var(--pro-muted)]">
              <Icon name="chevron-right" className="h-3.5 w-3.5" />
              <span className="font-medium text-[var(--pro-fg)]">
                QR Generator
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-md border border-[var(--pro-border)] bg-[var(--pro-surface)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--pro-surface-hover)]">
              <Icon name="more-horizontal" />
              History
            </button>
            <button className="flex items-center gap-2 rounded-md bg-[var(--pro-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--pro-accent-hover)]">
              <Icon name="upload" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1400px] p-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
          {/* Configuration Panel */}
          <div className="flex flex-col gap-4">
            {/* Customization Panel with Tabs */}
            <div className="overflow-hidden rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)]">
              {/* Tabs */}
              <div className="border-b border-[var(--pro-border)] px-5">
                <div className="flex">
                  {(["content", "colors", "style", "export"] as TabType[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`border-b-2 px-4 py-3.5 text-sm font-medium transition-all ${
                          activeTab === tab
                            ? "border-[var(--pro-accent)] text-[var(--pro-accent)]"
                            : "border-transparent text-[var(--pro-muted)] hover:text-[var(--pro-fg)]"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="p-5">
                  <div className="mb-5">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--pro-fg)]">
                      URL or Text{" "}
                      <span className="text-[var(--pro-error)]">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pro-muted)]">
                        <Icon name="globe" className="h-[18px] w-[18px]" />
                      </div>
                      <input
                        type="url"
                        id="contentInput"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          validateURL(e.target.value);
                        }}
                        placeholder="https://example.com"
                        className={`w-full rounded-md border py-2.5 pl-10 pr-20 text-sm outline-none transition-all ${
                          urlValid
                            ? "border-[var(--pro-success)] shadow-[0_0_0_3px_var(--pro-success-light)]"
                            : url
                              ? "border-[var(--pro-error)] shadow-[0_0_0_3px_var(--pro-error-light)]"
                              : "border-[var(--pro-border)] focus:border-[var(--pro-accent)] focus:shadow-[0_0_0_3px_var(--pro-accent-light)]"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        {url && (
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold ${
                              urlValid
                                ? "text-[var(--pro-success)]"
                                : "text-[var(--pro-error)]"
                            }`}
                          >
                            <Icon
                              name={urlValid ? "check" : "x"}
                              className="h-3.5 w-3.5"
                            />
                            {urlValid ? "Valid" : "Invalid"}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--pro-muted)]">
                      Enter a URL, text, or use one of the quick actions below
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => setTemplate(action.id)}
                        className="flex items-center gap-1 rounded border border-[var(--pro-border)] bg-[var(--pro-surface-hover)] px-2.5 py-1.5 text-xs font-medium transition-all hover:border-[var(--pro-accent)] hover:bg-[var(--pro-accent-light)] hover:text-[var(--pro-accent)]"
                      >
                        <Icon name={action.icon} className="h-3 w-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === "colors" && (
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Foreground Color */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold">
                        Foreground Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[var(--pro-border)]"
                          style={{ backgroundColor: fgColor }}
                        >
                          <input
                            type="color"
                            id="fgColorPicker"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          id="fgHexInput"
                          value={fgColor.toUpperCase()}
                          onChange={(e) =>
                            handleHexInput(e.target.value, setFgColor)
                          }
                          onBlur={(e) => {
                            if (!isValidHex(e.target.value)) {
                              setFgColor("#1a1a1a");
                            }
                          }}
                          className="flex-1 rounded-md border border-[var(--pro-border)] px-3 py-2 font-mono text-sm uppercase focus:border-[var(--pro-accent)] focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* Background Color */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[var(--pro-border)]"
                          style={{ backgroundColor: bgColor }}
                        >
                          <input
                            type="color"
                            id="bgColorPicker"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          id="bgHexInput"
                          value={bgColor.toUpperCase()}
                          onChange={(e) =>
                            handleHexInput(e.target.value, setBgColor)
                          }
                          onBlur={(e) => {
                            if (!isValidHex(e.target.value)) {
                              setBgColor("#ffffff");
                            }
                          }}
                          className="flex-1 rounded-md border border-[var(--pro-border)] px-3 py-2 font-mono text-sm uppercase focus:border-[var(--pro-accent)] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contrast Alert */}
                  <div
                    id="contrastAlert"
                    className={`mt-4 flex items-start gap-3 rounded-md border p-3 ${
                      wcagAAA
                        ? "border-[var(--pro-success)] bg-[var(--pro-success-light)]"
                        : wcagAA
                          ? "border-[var(--pro-warning)] bg-[var(--pro-warning-light)]"
                          : "border-[var(--pro-error)] bg-[var(--pro-error-light)]"
                    }`}
                  >
                    <Icon
                      name={
                        wcagAAA
                          ? "check-circle"
                          : wcagAA
                            ? "alert-circle"
                            : "x-circle"
                      }
                      className={`h-5 w-5 shrink-0 ${
                        wcagAAA
                          ? "text-[var(--pro-success)]"
                          : wcagAA
                            ? "text-[var(--pro-warning)]"
                            : "text-[var(--pro-error)]"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {wcagAAA
                          ? `Excellent Contrast (${contrastRatio.toFixed(1)}:1)`
                          : wcagAA
                            ? `Good Contrast (${contrastRatio.toFixed(1)}:1)`
                            : `Low Contrast (${contrastRatio.toFixed(1)}:1)`}
                      </div>
                      <div className="text-xs text-[var(--pro-muted)]">
                        {wcagAAA
                          ? "Your QR code will be easily scannable"
                          : wcagAA
                            ? "QR code should be scannable, but higher contrast recommended"
                            : "QR code may be difficult to scan - increase contrast"}
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <span
                          id="wcagAA"
                          className={`rounded bg-white px-2 py-0.5 text-[10px] font-bold ${
                            wcagAA
                              ? "text-[var(--pro-success)]"
                              : "text-[var(--pro-error)] line-through"
                          }`}
                        >
                          AA {wcagAA ? "✓" : "✗"}
                        </span>
                        <span
                          id="wcagAAA"
                          className={`rounded bg-white px-2 py-0.5 text-[10px] font-bold ${
                            wcagAAA
                              ? "text-[var(--pro-success)]"
                              : "text-[var(--pro-error)] line-through"
                          }`}
                        >
                          AAA {wcagAAA ? "✓" : "✗"}
                        </span>
                        <span
                          className={`rounded bg-white px-2 py-0.5 text-[10px] font-bold ${
                            contrastRatio >= 3
                              ? "text-[var(--pro-success)]"
                              : "text-[var(--pro-error)] line-through"
                          }`}
                        >
                          Large Text {contrastRatio >= 3 ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)]">
                    <div className="h-px flex-1 bg-[var(--pro-border)]" />
                    Presets
                    <div className="h-px flex-1 bg-[var(--pro-border)]" />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => selectColorPreset(preset.color)}
                        className={`rounded-md border p-3 text-center transition-all ${
                          fgColor === preset.color
                            ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                            : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                        }`}
                      >
                        <div
                          className="mx-auto mb-1.5 h-6 w-6 rounded"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            fgColor === preset.color
                              ? "text-[var(--pro-accent)]"
                              : "text-[var(--pro-muted)]"
                          }`}
                        >
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Tab */}
              {activeTab === "style" && (
                <div className="p-5">
                  {/* Data Pattern */}
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Data Pattern
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        ["square", "rounded", "dots", "classy"] as PatternType[]
                      ).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPattern(p)}
                          className={`rounded-md border p-3 text-center transition-all ${
                            pattern === p
                              ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                              : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                          }`}
                        >
                          <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              {p === "square" && (
                                <>
                                  <rect x="4" y="4" width="5" height="5" />
                                  <rect x="10" y="4" width="5" height="5" />
                                  <rect x="4" y="10" width="5" height="5" />
                                  <rect x="16" y="10" width="5" height="5" />
                                  <rect x="10" y="16" width="5" height="5" />
                                  <rect x="16" y="16" width="5" height="5" />
                                </>
                              )}
                              {p === "rounded" && (
                                <>
                                  <rect
                                    x="4"
                                    y="4"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                  <rect
                                    x="10"
                                    y="4"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                  <rect
                                    x="4"
                                    y="10"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                  <rect
                                    x="16"
                                    y="10"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                  <rect
                                    x="10"
                                    y="16"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                  <rect
                                    x="16"
                                    y="16"
                                    width="5"
                                    height="5"
                                    rx="1"
                                  />
                                </>
                              )}
                              {p === "dots" && (
                                <>
                                  <circle cx="6.5" cy="6.5" r="2.5" />
                                  <circle cx="12.5" cy="6.5" r="2.5" />
                                  <circle cx="6.5" cy="12.5" r="2.5" />
                                  <circle cx="18.5" cy="12.5" r="2.5" />
                                  <circle cx="12.5" cy="18.5" r="2.5" />
                                  <circle cx="18.5" cy="18.5" r="2.5" />
                                </>
                              )}
                              {p === "classy" && (
                                <>
                                  <path d="M4 4h5v5H4z" />
                                  <path d="M10 4h5v5h-5z" />
                                  <path d="M4 10h5v5H4z" />
                                  <path d="M16 10h5v5h-5z" />
                                  <path d="M10 16h5v5h-5z" />
                                  <path d="M16 16h5v5h-5z" />
                                </>
                              )}
                            </svg>
                          </div>
                          <span
                            className={`text-xs font-semibold capitalize ${
                              pattern === p
                                ? "text-[var(--pro-accent)]"
                                : "text-[var(--pro-muted)]"
                            }`}
                          >
                            {p}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Style */}
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Corner Style
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        ["square", "rounded", "extra", "dot"] as CornerType[]
                      ).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCornerStyle(c)}
                          className={`rounded-md border p-3 text-center transition-all ${
                            cornerStyle === c
                              ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                              : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                          }`}
                        >
                          <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              {c === "square" && (
                                <rect x="4" y="4" width="16" height="16" />
                              )}
                              {c === "rounded" && (
                                <rect
                                  x="4"
                                  y="4"
                                  width="16"
                                  height="16"
                                  rx="4"
                                />
                              )}
                              {c === "extra" && (
                                <rect
                                  x="4"
                                  y="4"
                                  width="16"
                                  height="16"
                                  rx="8"
                                />
                              )}
                              {c === "dot" && <circle cx="12" cy="12" r="8" />}
                            </svg>
                          </div>
                          <span
                            className={`text-xs font-semibold capitalize ${
                              cornerStyle === c
                                ? "text-[var(--pro-accent)]"
                                : "text-[var(--pro-muted)]"
                            }`}
                          >
                            {c}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Correction */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold">
                      Error Correction Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ERROR_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setErrorLevel(level.value)}
                          className={`rounded-md border p-3 text-center transition-all ${
                            errorLevel === level.value
                              ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                              : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                          }`}
                        >
                          <div className="text-base font-bold">
                            {level.label}
                          </div>
                          <span
                            className={`text-xs ${
                              errorLevel === level.value
                                ? "text-[var(--pro-accent)]"
                                : "text-[var(--pro-muted)]"
                            }`}
                          >
                            {level.percentage}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--pro-muted)]">
                      Higher levels allow QR to work even when partially damaged
                    </p>
                  </div>
                </div>
              )}

              {/* Export Tab */}
              {activeTab === "export" && (
                <div className="p-5">
                  {/* Export Format */}
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Export Format
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          {
                            value: "png",
                            label: "PNG",
                            info: "~12 KB • Raster",
                            recommended: true,
                          },
                          {
                            value: "svg",
                            label: "SVG",
                            info: "~4 KB • Vector",
                            recommended: false,
                          },
                          {
                            value: "pdf",
                            label: "PDF",
                            info: "~8 KB • Print",
                            recommended: false,
                          },
                        ] as const
                      ).map((format) => (
                        <button
                          key={format.value}
                          onClick={() => setExportFormat(format.value)}
                          className={`relative rounded-md border p-4 text-center transition-all ${
                            exportFormat === format.value
                              ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                              : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)]"
                          }`}
                        >
                          {format.recommended && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-[var(--pro-accent)] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                              Recommended
                            </span>
                          )}
                          <div className="text-base font-bold">
                            {format.label}
                          </div>
                          <div className="text-xs text-[var(--pro-muted)]">
                            {format.info}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality (DPI) - only for PNG */}
                  {exportFormat === "png" && (
                    <div className="mb-5">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-medium">
                          Quality (DPI)
                        </label>
                        <span className="text-xs font-semibold text-[var(--pro-accent)]">
                          {dpi} DPI
                        </span>
                      </div>
                      <input
                        type="range"
                        min="72"
                        max="300"
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--pro-border)] accent-[var(--pro-accent)]"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-[var(--pro-muted)]">
                        <span>72 (Web)</span>
                        <span>150 (Standard)</span>
                        <span>300 (Print)</span>
                      </div>
                    </div>
                  )}

                  {/* Output Size */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold">
                      Output Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([256, 512, 1024, 2048] as SizeType[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setExportSize(size)}
                          className={`rounded-md border p-3 text-center transition-all ${
                            exportSize === size
                              ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)]"
                              : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                          }`}
                        >
                          <div className="text-xs font-semibold">{size}</div>
                          <span
                            className={`text-xs ${
                              exportSize === size
                                ? "text-[var(--pro-accent)]"
                                : "text-[var(--pro-muted)]"
                            }`}
                          >
                            {size === 256
                              ? "Small"
                              : size === 512
                                ? "Medium"
                                : size === 1024
                                  ? "Large"
                                  : "XL"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <aside className="sticky top-6 overflow-hidden rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)] max-lg:order-first lg:order-none">
            <div className="flex items-center justify-between border-b border-[var(--pro-border)] px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Icon
                  name="qr"
                  className="h-[18px] w-[18px] text-[var(--pro-muted)]"
                />
                Preview
              </h2>
              <span className="rounded bg-[var(--pro-success-light)] px-2 py-1 text-xs font-semibold text-[var(--pro-success)]">
                Live
              </span>
            </div>

            {/* QR Preview Area */}
            <div
              className="flex min-h-[300px] items-center justify-center p-8"
              style={{
                background:
                  "repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 16px 16px",
              }}
            >
              <div className="rounded-lg bg-white p-5 shadow-md">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    id="qrPreview"
                    src={qrDataUrl}
                    alt={`QR code linking to ${generatedUrl}`}
                    className="h-[200px] w-[200px] transition-transform"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                ) : (
                  <div
                    id="qrPreview"
                    className="flex h-[200px] w-[200px] items-center justify-center"
                  >
                    <Icon
                      name="qr"
                      className="h-16 w-16 text-[var(--pro-border)]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-2 border-t border-[var(--pro-border)] px-5 py-4">
              <button
                onClick={zoomOut}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)]"
                title="Zoom out"
              >
                <Icon name="zoom-out" />
              </button>
              <span
                id="zoomValue"
                className="min-w-[50px] text-center text-sm font-semibold"
              >
                {zoomLevel}%
              </span>
              <button
                onClick={zoomIn}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)]"
                title="Zoom in"
              >
                <Icon name="zoom-in" />
              </button>
              <button
                onClick={resetZoom}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)]"
                title="Reset zoom"
              >
                <Icon name="refresh-cw" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 border-t border-[var(--pro-border)] px-5 py-4">
              <button
                onClick={copyToClipboard}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[var(--pro-border)] py-2.5 text-sm font-medium transition-colors hover:bg-[var(--pro-surface-hover)]"
              >
                <Icon name="copy" />
                Copy
              </button>
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "QR Code", url: url });
                    } catch {
                      copyToClipboard();
                    }
                  } else {
                    copyToClipboard();
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[var(--pro-border)] py-2.5 text-sm font-medium transition-colors hover:bg-[var(--pro-surface-hover)]"
              >
                <Icon name="share" />
                Share
              </button>
            </div>

            {/* Download Section */}
            <div className="border-t border-[var(--pro-border)] bg-[var(--pro-surface-hover)] p-5">
              <button
                onClick={downloadQR}
                disabled={isGenerating || !qrDataUrl}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--pro-accent)] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--pro-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--pro-muted-light)]"
              >
                <Icon name="download" className="h-[18px] w-[18px]" />
                Download QR Code
              </button>
              <p className="mt-3 text-center text-xs text-[var(--pro-muted)]">
                Keyboard shortcut:{" "}
                <kbd className="rounded border border-[var(--pro-border)] bg-white px-1.5 py-0.5 text-[11px]">
                  ⌘
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border border-[var(--pro-border)] bg-white px-1.5 py-0.5 text-[11px]">
                  D
                </kbd>
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Toast Container with slide-in animation */}
      <div
        id="toastContainer"
        className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slideIn flex items-center gap-2.5 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === "success"
                ? "bg-[var(--pro-success)]"
                : "bg-[var(--pro-error)]"
            }`}
          >
            <Icon
              name={toast.type === "success" ? "check" : "x"}
              className="h-[18px] w-[18px]"
            />
            {toast.message}
          </div>
        ))}
      </div>

      {/* Hidden canvas for potential future use */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
