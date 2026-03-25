"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";
import { jsPDF } from "jspdf";

type TabType = "content" | "colors" | "style" | "export";
type ToastType = { message: string; type: "success" | "error"; id: number };
type ErrorLevelType = "L" | "M" | "Q" | "H";
type PatternType = "square" | "rounded" | "dots" | "classy";
type CornerType = "square" | "rounded" | "extra" | "dot";
type FormatType = "png" | "svg" | "pdf" | "eps";
type SizeType = 256 | 512 | 1024 | 2048;
type DpiType = 72 | 150 | 300 | 600;

// Format info for cards
const FORMAT_INFO = {
  png: {
    label: "PNG",
    description: "Raster image",
    badge: "Web & Social",
    badgeColor: "bg-green-100 text-green-700",
    isVector: false,
    tip: "Best for web, social media, and digital use. Supports transparency and works everywhere.",
  },
  svg: {
    label: "SVG",
    description: "Vector graphic",
    badge: "Scalable",
    badgeColor: "bg-purple-100 text-purple-700",
    isVector: true,
    tip: "Vector format that scales infinitely. Perfect for logos, large prints, and developers.",
  },
  pdf: {
    label: "PDF",
    description: "Document format",
    badge: "Print Ready",
    badgeColor: "bg-red-100 text-red-700",
    isVector: true,
    tip: "Universal print format. Great for business cards, flyers, and professional printing.",
  },
  eps: {
    label: "EPS",
    description: "Adobe compatible",
    badge: "Professional",
    badgeColor: "bg-orange-100 text-orange-700",
    isVector: true,
    tip: "Adobe Illustrator/InDesign compatible. Industry standard for professional design work.",
  },
} as const;

// Resolution snap points for export
const RESOLUTION_SNAP_POINTS = [200, 500, 1000, 1500, 2000] as const;
type ResolutionType = (typeof RESOLUTION_SNAP_POINTS)[number];

// DPI options for print quality
const DPI_OPTIONS = [
  {
    value: 72 as DpiType,
    label: "72",
    badge: "WEB",
    badgeColor: "bg-gray-100 text-gray-600",
    description: "Screen display, websites, email",
  },
  {
    value: 150 as DpiType,
    label: "150",
    badge: "PRINT",
    badgeColor: "bg-blue-100 text-blue-600",
    description: "Standard print, flyers, posters",
  },
  {
    value: 300 as DpiType,
    label: "300",
    badge: "HIGH",
    badgeColor: "bg-green-100 text-green-600",
    description: "Business cards, brochures",
  },
  {
    value: 600 as DpiType,
    label: "600",
    badge: "PRO",
    badgeColor: "bg-purple-100 text-purple-600",
    description: "Professional print, packaging",
  },
] as const;

// Minimum size in inches for reliable scanning
const MIN_SIZE_INCHES = 0.8;

// Calculate physical size from pixels and DPI
const calculatePhysicalSize = (
  pixels: number,
  dpi: number
): { inches: number; cm: number } => {
  const inches = pixels / dpi;
  const cm = inches * 2.54;
  return { inches, cm };
};

// Calculate approximate scanning distance (rough formula: ~3ft per inch of QR size)
const calculateScanDistance = (
  sizeInches: number
): { feet: number; meters: number } => {
  const feet = Math.round(sizeInches * 3);
  const meters = parseFloat((feet * 0.3048).toFixed(1));
  return { feet, meters };
};

// File size estimates for each resolution (in KB)
const FILE_SIZE_ESTIMATES: Record<ResolutionType, string> = {
  200: "~5",
  500: "~15",
  1000: "~45",
  1500: "~95",
  2000: "~160",
};

// Calculate file size estimate based on resolution
const estimateFileSize = (resolution: number): string => {
  // Find the closest snap point
  const closest = RESOLUTION_SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - resolution) < Math.abs(prev - resolution) ? curr : prev
  );
  return FILE_SIZE_ESTIMATES[closest];
};

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

function GeneratorContent() {
  // Get URL from query params
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url");

  // Form state
  const [url, setUrl] = useState(urlParam || "https://example.com");
  const [urlValid, setUrlValid] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [urlInitialized, setUrlInitialized] = useState(false);

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
  const [exportResolution, setExportResolution] = useState<number>(1000);
  const [dpi, setDpi] = useState<DpiType>(300);

  // Toast state - support multiple toasts with IDs
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const toastIdRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update URL from query param when it changes
  useEffect(() => {
    if (urlParam && !urlInitialized) {
      setUrl(urlParam);
      setUrlInitialized(true);
    }
  }, [urlParam, urlInitialized]);

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
        width: exportResolution,
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
  }, [url, exportResolution, fgColor, bgColor, errorLevel, showToast]);

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

  // Handle resolution slider with snap behavior
  const handleResolutionChange = (value: number) => {
    // Snap to nearest point if within 75px
    const closest = RESOLUTION_SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    if (Math.abs(value - closest) < 75) {
      setExportResolution(closest);
    } else {
      setExportResolution(value);
    }
  };

  // Calculate slider track percentage
  const getSliderTrackPercentage = (value: number): number => {
    return ((value - 200) / (2000 - 200)) * 100;
  };

  // Get snap point position as percentage
  const getSnapPointPosition = (snapValue: number): number => {
    return ((snapValue - 200) / (2000 - 200)) * 100;
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

  // Generate SVG string for QR code
  const generateSvgString = useCallback(async (): Promise<string> => {
    const svgString = await QRCode.toString(generatedUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorLevel,
    });
    return svgString;
  }, [generatedUrl, fgColor, bgColor, errorLevel]);

  // Generate EPS from SVG
  const generateEpsString = useCallback(async (): Promise<string> => {
    const svgString = await generateSvgString();

    // Parse the SVG to get width/height
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");
    const width = parseInt(svgElement?.getAttribute("width") || "100", 10);
    const height = parseInt(svgElement?.getAttribute("height") || "100", 10);

    // Create a simple EPS wrapper with embedded SVG
    // EPS header with proper bounding box
    const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: QRSpot - Multi-Format Export
%%Title: QR Code
%%BoundingBox: 0 0 ${width} ${height}
%%HiResBoundingBox: 0.000000 0.000000 ${width}.000000 ${height}.000000
%%DocumentData: Clean7Bit
%%LanguageLevel: 2
%%Pages: 1
%%EndComments
%%BeginProlog
/bd { bind def } bind def
/m { moveto } bd
/l { lineto } bd
/c { curveto } bd
/f { fill } bd
/s { stroke } bd
/rgb { setrgbcolor } bd
/rect { /h exch def /w exch def /y exch def /x exch def
  newpath x y m x w add y l x w add y h add l x y h add l closepath } bd
%%EndProlog
%%Page: 1 1
gsave
`;

    // Parse SVG paths and convert to PostScript
    // First, fill with background color
    const bgRgb = hexToRgbNormalized(bgColor);
    const fgRgb = hexToRgbNormalized(fgColor);

    let epsBody = `% Background
${bgRgb.r} ${bgRgb.g} ${bgRgb.b} rgb
0 0 ${width} ${height} rect f
`;

    // Find all path elements and convert them
    const paths = svgDoc.querySelectorAll("path");
    paths.forEach((path) => {
      const fill = path.getAttribute("fill");
      if (fill && fill !== "none" && fill !== bgColor) {
        const d = path.getAttribute("d");
        if (d) {
          epsBody += `% QR Module\n`;
          epsBody += `${fgRgb.r} ${fgRgb.g} ${fgRgb.b} rgb\n`;
          epsBody += `newpath\n`;
          epsBody += convertSvgPathToPs(d, height);
          epsBody += `f\n`;
        }
      }
    });

    const epsFooter = `grestore
showpage
%%EOF
`;

    return epsHeader + epsBody + epsFooter;
  }, [generateSvgString, bgColor, fgColor]);

  // Helper function to convert hex to normalized RGB
  const hexToRgbNormalized = (
    hex: string
  ): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  };

  // Convert SVG path d attribute to PostScript
  const convertSvgPathToPs = (d: string, svgHeight: number): string => {
    let ps = "";
    // Simple parser for M and L commands (QR codes are typically just rectangles)
    const commands = d.match(/[MmLlHhVvZz][^MmLlHhVvZz]*/g) || [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    commands.forEach((cmd) => {
      const type = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n));

      switch (type) {
        case "M":
          currentX = coords[0];
          currentY = svgHeight - coords[1]; // Flip Y for PostScript
          startX = currentX;
          startY = currentY;
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} m\n`;
          break;
        case "m":
          currentX += coords[0];
          currentY -= coords[1]; // Flip Y for PostScript
          startX = currentX;
          startY = currentY;
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} m\n`;
          break;
        case "L":
          currentX = coords[0];
          currentY = svgHeight - coords[1];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "l":
          currentX += coords[0];
          currentY -= coords[1];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "H":
          currentX = coords[0];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "h":
          currentX += coords[0];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "V":
          currentY = svgHeight - coords[0];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "v":
          currentY -= coords[0];
          ps += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
          break;
        case "Z":
        case "z":
          ps += `closepath\n`;
          currentX = startX;
          currentY = startY;
          break;
      }
    });

    return ps;
  };

  // Download QR code at specified resolution
  const downloadQR = useCallback(async () => {
    if (!generatedUrl) return;

    setIsGenerating(true);
    try {
      const formatInfo = FORMAT_INFO[exportFormat];
      const isVector = formatInfo.isVector;

      switch (exportFormat) {
        case "png": {
          // Generate PNG at export resolution
          const dataUrl = await QRCode.toDataURL(generatedUrl, {
            width: exportResolution,
            margin: 2,
            color: {
              dark: fgColor,
              light: bgColor,
            },
            errorCorrectionLevel: errorLevel,
          });

          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `qr-code.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast(
            `QR Code downloaded (${exportResolution}×${exportResolution}px)!`,
            "success"
          );
          break;
        }

        case "svg": {
          // Generate true vector SVG
          const svgString = await generateSvgString();

          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "qr-code.svg";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast("SVG downloaded (vector format)!", "success");
          break;
        }

        case "pdf": {
          // Generate PDF with embedded QR code as image for best compatibility
          const pngDataUrl = await QRCode.toDataURL(generatedUrl, {
            width: 1000, // High resolution for PDF
            margin: 2,
            color: {
              dark: fgColor,
              light: bgColor,
            },
            errorCorrectionLevel: errorLevel,
          });

          // Create A4 PDF with centered QR code
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          // A4 dimensions: 210 x 297 mm
          const pageWidth = 210;
          const pageHeight = 297;
          const qrSize = 100; // 100mm QR code size
          const x = (pageWidth - qrSize) / 2;
          const y = (pageHeight - qrSize) / 2;

          pdf.addImage(pngDataUrl, "PNG", x, y, qrSize, qrSize);

          pdf.save("qr-code.pdf");
          showToast("PDF downloaded (print-ready)!", "success");
          break;
        }

        case "eps": {
          // Generate EPS (Encapsulated PostScript) for Adobe compatibility
          const epsString = await generateEpsString();

          const blob = new Blob([epsString], {
            type: "application/postscript",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "qr-code.eps";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast("EPS downloaded (Adobe compatible)!", "success");
          break;
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to download QR code", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [
    generatedUrl,
    exportResolution,
    fgColor,
    bgColor,
    errorLevel,
    exportFormat,
    showToast,
    generateSvgString,
    generateEpsString,
  ]);

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
          width: exportResolution,
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
  }, [fgColor, bgColor, exportResolution, errorLevel]);

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
        <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="font-serif text-xl text-[var(--pro-fg)] sm:text-2xl">
              QR<span className="text-[var(--pro-accent)]">Spot</span>
            </Link>
            <nav className="hidden items-center gap-2 text-sm text-[var(--pro-muted)] sm:flex">
              <Icon name="chevron-right" className="h-3.5 w-3.5" />
              <span className="font-medium text-[var(--pro-fg)]">
                QR Generator
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button className="hidden items-center gap-2 rounded-md border border-[var(--pro-border)] bg-[var(--pro-surface)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--pro-surface-hover)] sm:flex sm:px-4 sm:py-2">
              <Icon name="more-horizontal" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-[var(--pro-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--pro-accent-hover)] sm:gap-2 sm:px-4 sm:py-2">
              <Icon name="upload" />
              <span className="hidden xs:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1400px] px-4 py-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6 xl:grid-cols-[1fr_420px]">
          {/* Configuration Panel */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {/* Customization Panel with Tabs */}
            <div className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)]">
              {/* Tabs */}
              <div className="border-b border-[var(--pro-border)] px-3 sm:px-5">
                <div className="-mb-px flex overflow-x-auto scrollbar-hide">
                  {(["content", "colors", "style", "export"] as TabType[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-4 sm:py-3.5 sm:text-sm ${
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
                <div className="p-4 sm:p-5">
                  <div className="mb-4 sm:mb-5">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--pro-fg)]">
                      URL or Text{" "}
                      <span className="text-[var(--pro-error)]">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pro-muted)]">
                        <Icon name="globe" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
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
                        className={`w-full rounded-md border py-2.5 pl-9 pr-16 text-sm outline-none transition-all sm:pl-10 sm:pr-20 ${
                          urlValid
                            ? "border-[var(--pro-success)] shadow-[0_0_0_3px_var(--pro-success-light)]"
                            : url
                              ? "border-[var(--pro-error)] shadow-[0_0_0_3px_var(--pro-error-light)]"
                              : "border-[var(--pro-border)] focus:border-[var(--pro-accent)] focus:shadow-[0_0_0_3px_var(--pro-accent-light)]"
                        }`}
                      />
                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-3 sm:gap-2">
                        {url && (
                          <span
                            className={`flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs ${
                              urlValid
                                ? "text-[var(--pro-success)]"
                                : "text-[var(--pro-error)]"
                            }`}
                          >
                            <Icon
                              name={urlValid ? "check" : "x"}
                              className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                            />
                            <span className="hidden xs:inline">{urlValid ? "Valid" : "Invalid"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] text-[var(--pro-muted)] sm:text-xs">
                      Enter a URL, text, or use one of the quick actions below
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => setTemplate(action.id)}
                        className="flex items-center gap-1 rounded border border-[var(--pro-border)] bg-[var(--pro-surface-hover)] px-2 py-1 text-[10px] font-medium transition-all hover:border-[var(--pro-accent)] hover:bg-[var(--pro-accent-light)] hover:text-[var(--pro-accent)] sm:px-2.5 sm:py-1.5 sm:text-xs"
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
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
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
                  <div className="mt-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)] sm:mt-6">
                    <div className="h-px flex-1 bg-[var(--pro-border)]" />
                    Presets
                    <div className="h-px flex-1 bg-[var(--pro-border)]" />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
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
                <div className="p-4 sm:p-5">
                  {/* Data Pattern */}
                  <div className="mb-4 sm:mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Data Pattern
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                  <div className="mb-4 sm:mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Corner Style
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                <div className="p-4 sm:p-5">
                  {/* Export Format - Card Grid with Icons */}
                  <div className="mb-4 sm:mb-6">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)] sm:mb-3">
                      <svg
                        className="h-4 w-4 text-[var(--pro-accent)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Export Format
                    </label>

                    {/* Format Cards Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                      {(["png", "svg", "pdf", "eps"] as FormatType[]).map(
                        (format) => {
                          const info = FORMAT_INFO[format];
                          const isSelected = exportFormat === format;
                          return (
                            <button
                              key={format}
                              onClick={() => setExportFormat(format)}
                              className={`group relative rounded-lg border-2 p-2.5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-4 ${
                                isSelected
                                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                                  : "border-[var(--pro-border)] bg-white hover:border-[var(--pro-border-dark)]"
                              }`}
                            >
                              {/* Icon */}
                              <div
                                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors sm:mb-3 sm:h-12 sm:w-12 ${
                                  isSelected
                                    ? "bg-[var(--pro-accent)] text-white"
                                    : "bg-[var(--pro-muted-light)] text-[var(--pro-muted)] group-hover:bg-[var(--pro-border)]"
                                }`}
                              >
                                {format === "png" && (
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                                {format === "svg" && (
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                    />
                                  </svg>
                                )}
                                {format === "pdf" && (
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                )}
                                {format === "eps" && (
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                                    />
                                  </svg>
                                )}
                              </div>
                              {/* Label */}
                              <div className="text-sm font-bold text-[var(--pro-fg)] sm:text-base">
                                {info.label}
                              </div>
                              <div className="mt-0.5 hidden text-xs text-[var(--pro-muted)] sm:mt-1 sm:block">
                                {info.description}
                              </div>
                              {/* Badge */}
                              <span
                                className={`mt-1.5 inline-block rounded px-1 py-0.5 text-[8px] font-medium sm:mt-2 sm:px-1.5 sm:text-[9px] ${info.badgeColor}`}
                              >
                                {info.badge}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* Format Info Tooltip */}
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-[var(--pro-accent-light)] p-3">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--pro-accent)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs text-[var(--pro-accent)]">
                        <strong>{FORMAT_INFO[exportFormat].label}</strong> -{" "}
                        {FORMAT_INFO[exportFormat].tip}
                      </p>
                    </div>
                  </div>

                  {/* HIGH-RESOLUTION EXPORT CONTROLS - Only for PNG (raster format) */}
                  {!FORMAT_INFO[exportFormat].isVector && (
                    <div className="mb-6 rounded-xl border border-[var(--pro-border)] bg-gradient-to-br from-[var(--pro-surface)] to-[var(--pro-surface-hover)] p-5">
                      {/* Resolution Header with Live Display */}
                      <div className="mb-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)]">
                          <svg
                            className="h-4 w-4 text-[var(--pro-accent)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                          Resolution
                        </label>
                        {/* Large Resolution Display */}
                        <div className="text-right">
                          <span className="text-3xl font-bold text-[var(--pro-accent)] transition-transform">
                            {exportResolution}
                          </span>
                          <span className="text-lg text-[var(--pro-muted)]">
                            px
                          </span>
                        </div>
                      </div>

                      {/* Slider Container */}
                      <div className="relative mb-6 pb-8 pt-2">
                        {/* Slider Track Background */}
                        <div className="absolute left-0 right-0 top-[18px] h-2 rounded-full bg-[var(--pro-muted-light)]" />

                        {/* Active Track */}
                        <div
                          className="absolute left-0 top-[18px] h-2 rounded-full bg-[var(--pro-accent)]"
                          style={{
                            width: `${getSliderTrackPercentage(exportResolution)}%`,
                          }}
                        />

                        {/* Snap Points */}
                        <div className="absolute left-0 right-0 top-[18px]">
                          {RESOLUTION_SNAP_POINTS.map((snapValue) => (
                            <div
                              key={snapValue}
                              className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
                                snapValue <= exportResolution
                                  ? "bg-[var(--pro-accent)]"
                                  : "bg-[var(--pro-muted-light)]"
                              }`}
                              style={{
                                left: `${getSnapPointPosition(snapValue)}%`,
                                top: "50%",
                              }}
                            />
                          ))}
                        </div>

                        {/* Slider Input */}
                        <input
                          type="range"
                          min="200"
                          max="2000"
                          step="1"
                          value={exportResolution}
                          onChange={(e) =>
                            handleResolutionChange(Number(e.target.value))
                          }
                          className="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--pro-accent)] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(37,99,235,0.3)] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--pro-accent)] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(37,99,235,0.3)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                        />

                        {/* Labels below */}
                        <div className="absolute left-0 right-0 top-10 flex justify-between px-0">
                          <span className="text-center text-[11px]">
                            <span className="text-[var(--pro-muted)]">
                              200px
                            </span>
                            <br />
                            <span className="text-[10px] text-[var(--pro-muted)]">
                              Web
                            </span>
                          </span>
                          <span className="text-center text-[11px] text-[var(--pro-muted)]">
                            500px
                          </span>
                          <span
                            className={`text-center text-[11px] font-semibold ${exportResolution === 1000 ? "text-[var(--pro-accent)]" : "text-[var(--pro-muted)]"}`}
                          >
                            1000px
                            <br />
                            <span className="text-[10px]">Default</span>
                          </span>
                          <span className="text-center text-[11px] text-[var(--pro-muted)]">
                            1500px
                          </span>
                          <span className="text-center text-[11px]">
                            <span className="text-[var(--pro-muted)]">
                              2000px
                            </span>
                            <br />
                            <span className="text-[10px] text-[var(--pro-muted)]">
                              Print
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* File Size Estimator */}
                      <div className="flex items-center justify-between rounded-lg border border-[var(--pro-border)] bg-white p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pro-accent-light)]">
                            <svg
                              className="h-5 w-5 text-[var(--pro-accent)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--pro-fg)]">
                              Estimated File Size
                            </div>
                            <div className="text-xs text-[var(--pro-muted)]">
                              Based on {exportResolution}×{exportResolution}px
                              PNG
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[var(--pro-fg)]">
                            {estimateFileSize(exportResolution)}
                          </span>
                          <span className="text-sm text-[var(--pro-muted)]">
                            {" "}
                            KB
                          </span>
                        </div>
                      </div>

                      {/* Size Guide Tooltip */}
                      <div className="mt-3 flex items-start gap-2 text-xs text-[var(--pro-muted)]">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--pro-accent)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          <strong>Tip:</strong> Use 200-500px for web/social,
                          1000px for general use, 1500-2000px for print
                          materials.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Print Quality Section - Only for PNG (raster format) */}
                  {!FORMAT_INFO[exportFormat].isVector && (
                    <div className="mb-6 space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center gap-2 border-b border-[var(--pro-border)] pb-2">
                        <svg
                          className="h-5 w-5 text-[var(--pro-accent)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                        <h3 className="text-sm font-semibold text-[var(--pro-fg)]">
                          Print Quality Settings
                        </h3>
                      </div>

                      {/* DPI Cards */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)]">
                          Print Quality (DPI)
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                          {DPI_OPTIONS.map((option) => {
                            const isSelected = dpi === option.value;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setDpi(option.value)}
                                className={`rounded-lg border-2 bg-white p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-3 ${
                                  isSelected
                                    ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                                    : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)]"
                                }`}
                              >
                                <div className="mb-1 flex items-center justify-between sm:mb-2">
                                  <span
                                    className={`text-lg font-bold sm:text-xl ${
                                      isSelected
                                        ? "text-[var(--pro-accent)]"
                                        : "text-[var(--pro-fg)]"
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium sm:px-2 sm:text-[9px] ${
                                      isSelected
                                        ? "bg-[var(--pro-accent)] text-white"
                                        : option.badgeColor
                                    }`}
                                  >
                                    {option.badge}
                                  </span>
                                </div>
                                <p className="hidden text-[10px] leading-tight text-[var(--pro-muted)] sm:block">
                                  {option.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Physical Size Calculator */}
                      <div className="rounded-xl border border-[var(--pro-border)] bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] p-5">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--pro-fg)]">
                              <svg
                                className="h-4 w-4 text-[var(--pro-accent)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              Physical Size Calculator
                            </h4>
                            <p className="mt-1 text-[10px] text-[var(--pro-muted)]">
                              Calculated from resolution and DPI
                            </p>
                          </div>
                          {/* Size Preview Square */}
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-[var(--pro-accent)] bg-white">
                            <div className="flex h-8 w-8 items-center justify-center rounded border border-[var(--pro-accent)] bg-[var(--pro-accent-light)]">
                              <svg
                                className="h-4 w-4 text-[var(--pro-accent)]"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 0h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Size Display Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border border-[var(--pro-border)] bg-white p-3">
                            <div className="mb-1 text-[10px] uppercase tracking-wide text-[var(--pro-muted)]">
                              Inches
                            </div>
                            <div className="text-xl font-bold text-[var(--pro-fg)]">
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).inches.toFixed(1)}
                              &quot; ×{" "}
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).inches.toFixed(1)}
                              &quot;
                            </div>
                          </div>
                          <div className="rounded-lg border border-[var(--pro-border)] bg-white p-3">
                            <div className="mb-1 text-[10px] uppercase tracking-wide text-[var(--pro-muted)]">
                              Centimeters
                            </div>
                            <div className="text-xl font-bold text-[var(--pro-fg)]">
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).cm.toFixed(1)}
                              cm ×{" "}
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).cm.toFixed(1)}
                              cm
                            </div>
                          </div>
                        </div>

                        {/* Size Warning */}
                        {calculatePhysicalSize(exportResolution, dpi).inches <
                          MIN_SIZE_INCHES && (
                          <div className="mt-4">
                            <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-[var(--pro-warning-light)] p-3">
                              <svg
                                className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pro-warning)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              <div>
                                <div className="text-sm font-semibold text-[var(--pro-warning)]">
                                  Size Warning
                                </div>
                                <p className="mt-0.5 text-xs text-[var(--pro-warning)]">
                                  QR code may be too small for reliable
                                  scanning. Minimum recommended: 0.8&quot; (2cm)
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Print Quality Checklist */}
                      <div className="rounded-xl border border-[var(--pro-border)] bg-white p-4">
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)]">
                          <svg
                            className="h-4 w-4 text-[var(--pro-accent)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Print Quality Checklist
                        </h4>
                        <div className="space-y-2">
                          {/* Resolution Check */}
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              exportResolution >= 300
                                ? "text-[var(--pro-success)]"
                                : "text-[var(--pro-warning)]"
                            }`}
                          >
                            <svg
                              className="h-4 w-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {exportResolution >= 300 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              )}
                            </svg>
                            <span>
                              Resolution sufficient for print (
                              {exportResolution}
                              px)
                            </span>
                          </div>
                          {/* Format Check */}
                          <div className="flex items-center gap-2 text-sm text-[var(--pro-success)]">
                            <svg
                              className="h-4 w-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>
                              {FORMAT_INFO[exportFormat].label} format (raster,
                              transparent background)
                            </span>
                          </div>
                          {/* Size Check */}
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              calculatePhysicalSize(exportResolution, dpi)
                                .inches >= MIN_SIZE_INCHES
                                ? "text-[var(--pro-success)]"
                                : "text-[var(--pro-warning)]"
                            }`}
                          >
                            <svg
                              className="h-4 w-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {calculatePhysicalSize(exportResolution, dpi)
                                .inches >= MIN_SIZE_INCHES ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              )}
                            </svg>
                            <span>
                              Size adequate for scanning (
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).inches.toFixed(1)}
                              &quot; /{" "}
                              {calculatePhysicalSize(
                                exportResolution,
                                dpi
                              ).cm.toFixed(1)}
                              cm)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scanning Distance Guide */}
                      <div className="rounded-lg border border-blue-200 bg-[var(--pro-accent-light)] p-3">
                        <div className="flex items-start gap-2">
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--pro-accent)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-xs text-[var(--pro-accent)]">
                            <strong>Scanning Distance Guide:</strong> At{" "}
                            {calculatePhysicalSize(
                              exportResolution,
                              dpi
                            ).inches.toFixed(1)}
                            &quot;, this QR code can be scanned from
                            approximately{" "}
                            <span className="font-semibold">
                              {
                                calculateScanDistance(
                                  calculatePhysicalSize(exportResolution, dpi)
                                    .inches
                                ).feet
                              }{" "}
                              feet (
                              {
                                calculateScanDistance(
                                  calculatePhysicalSize(exportResolution, dpi)
                                    .inches
                                ).meters
                              }
                              m)
                            </span>{" "}
                            away.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vector Format Notice - Only for SVG, PDF, EPS */}
                  {FORMAT_INFO[exportFormat].isVector && (
                    <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                          <svg
                            className="h-5 w-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-purple-900">
                            Vector Format Selected
                          </div>
                          <p className="mt-1 text-xs text-purple-700">
                            Vector files are infinitely scalable - no resolution
                            setting needed. Perfect for printing at any size
                            without quality loss.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={downloadQR}
                    disabled={isGenerating || !generatedUrl}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--pro-accent)] py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--pro-accent-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[var(--pro-muted-light)]"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {FORMAT_INFO[exportFormat].isVector
                      ? `Download ${FORMAT_INFO[exportFormat].label}`
                      : `Download ${FORMAT_INFO[exportFormat].label} (${exportResolution}px @ ${dpi} DPI)`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <aside className="order-1 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)] lg:sticky lg:top-6 lg:order-2">
            <div className="flex items-center justify-between border-b border-[var(--pro-border)] px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Icon
                  name="qr"
                  className="h-4 w-4 text-[var(--pro-muted)] sm:h-[18px] sm:w-[18px]"
                />
                Preview
              </h2>
              <span className="rounded bg-[var(--pro-success-light)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--pro-success)] sm:px-2 sm:py-1 sm:text-xs">
                Live
              </span>
            </div>

            {/* QR Preview Area */}
            <div
              className="flex min-h-[200px] items-center justify-center p-4 sm:min-h-[300px] sm:p-8"
              style={{
                background:
                  "repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 16px 16px",
              }}
            >
              <div className="rounded-lg bg-white p-3 shadow-md sm:p-5">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    id="qrPreview"
                    src={qrDataUrl}
                    alt={`QR code linking to ${generatedUrl}`}
                    className="h-[140px] w-[140px] transition-transform sm:h-[200px] sm:w-[200px]"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                ) : (
                  <div
                    id="qrPreview"
                    className="flex h-[140px] w-[140px] items-center justify-center sm:h-[200px] sm:w-[200px]"
                  >
                    <Icon
                      name="qr"
                      className="h-12 w-12 text-[var(--pro-border)] sm:h-16 sm:w-16"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-1.5 border-t border-[var(--pro-border)] px-4 py-3 sm:gap-2 sm:px-5 sm:py-4">
              <button
                onClick={zoomOut}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)] sm:h-9 sm:w-9"
                title="Zoom out"
              >
                <Icon name="zoom-out" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <span
                id="zoomValue"
                className="min-w-[40px] text-center text-xs font-semibold sm:min-w-[50px] sm:text-sm"
              >
                {zoomLevel}%
              </span>
              <button
                onClick={zoomIn}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)] sm:h-9 sm:w-9"
                title="Zoom in"
              >
                <Icon name="zoom-in" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={resetZoom}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--pro-border)] text-[var(--pro-muted)] transition-colors hover:bg-[var(--pro-surface-hover)] hover:text-[var(--pro-fg)] sm:h-9 sm:w-9"
                title="Reset zoom"
              >
                <Icon name="refresh-cw" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 border-t border-[var(--pro-border)] px-4 py-3 sm:gap-2 sm:px-5 sm:py-4">
              <button
                onClick={copyToClipboard}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--pro-border)] py-2 text-xs font-medium transition-colors hover:bg-[var(--pro-surface-hover)] sm:gap-2 sm:py-2.5 sm:text-sm"
              >
                <Icon name="copy" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--pro-border)] py-2 text-xs font-medium transition-colors hover:bg-[var(--pro-surface-hover)] sm:gap-2 sm:py-2.5 sm:text-sm"
              >
                <Icon name="share" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Share
              </button>
            </div>

            {/* Download Section */}
            <div className="border-t border-[var(--pro-border)] bg-[var(--pro-surface-hover)] p-4 sm:p-5">
              <button
                onClick={downloadQR}
                disabled={isGenerating || !qrDataUrl}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--pro-accent)] py-3 text-xs font-semibold text-white transition-colors hover:bg-[var(--pro-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--pro-muted-light)] sm:gap-2 sm:py-3.5 sm:text-sm"
              >
                <Icon name="download" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                Download QR Code
              </button>
              <p className="mt-2 hidden text-center text-xs text-[var(--pro-muted)] sm:mt-3 sm:block">
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

// Wrapper component with Suspense for useSearchParams
export default function GeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <div className="text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-muted">Loading generator...</p>
          </div>
        </div>
      }
    >
      <GeneratorContent />
    </Suspense>
  );
}
