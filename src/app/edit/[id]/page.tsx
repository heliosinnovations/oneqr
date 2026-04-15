"use client";

import { useState, useRef, useCallback, useEffect, Suspense, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/client";
import {
  WiFiForm,
  ContactForm,
  WiFiFormData,
  ContactFormData,
  initialWiFiData,
  initialContactData,
  generateWiFiString,
  generateVCardString,
} from "@/components/ContentTypeForms";

type TabType =
  | "content"
  | "labels"
  | "colors"
  | "style"
  | "export"
  | "analytics";
type ToastType = { message: string; type: "success" | "error"; id: number };
type ErrorLevelType = "L" | "M" | "Q" | "H";
type PatternType = "square" | "rounded" | "dots" | "classy";
type CornerType = "square" | "rounded" | "extra" | "dot";
type FormatType = "png" | "svg" | "pdf" | "eps";
type DpiType = 72 | 150 | 300 | 600;
type FontWeightType = "normal" | "500" | "bold";
type FontFamilyType = "Arial" | "Helvetica" | "Times New Roman" | "Courier New";

interface QRCodeData {
  id: string;
  title: string;
  short_code: string;
  destination_url: string;
  is_editable: boolean;
  scan_count: number;
  qr_data: QRCustomizationData | null;
  created_at: string;
  updated_at: string;
}

interface QRCustomizationData {
  foreground_color?: string;
  background_color?: string;
  pattern?: string;
  corner_style?: string;
  error_level?: string;
  text_above?: string;
  text_below?: string;
  text_font_size?: number;
  text_font_weight?: string;
  text_font_family?: string;
  text_color?: string;
}

interface ScanData {
  day: string;
  count: number;
}

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

// Calculate approximate scanning distance
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

// Font weight options for text labels
const FONT_WEIGHT_OPTIONS: { value: FontWeightType; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "bold", label: "Bold" },
];

// Font family options for text labels
const FONT_FAMILY_OPTIONS: { value: FontFamilyType; label: string }[] = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times" },
  { value: "Courier New", label: "Courier" },
];

// Text padding between QR and labels (in pixels at 1000px resolution)
const TEXT_PADDING = 16;

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

// Helper to check if a position is part of a finder pattern (corner squares)
const isFinderPattern = (row: number, col: number, size: number): boolean => {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= size - 7) return true;
  if (row >= size - 7 && col < 7) return true;
  return false;
};

// Render a single module based on pattern type
const renderModule = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  pattern: PatternType,
  fgColor: string
): void => {
  ctx.fillStyle = fgColor;

  switch (pattern) {
    case "square":
      ctx.fillRect(x, y, moduleSize, moduleSize);
      break;
    case "rounded":
      const radius = moduleSize * 0.3;
      ctx.beginPath();
      ctx.roundRect(x, y, moduleSize, moduleSize, radius);
      ctx.fill();
      break;
    case "dots":
      const dotRadius = moduleSize * 0.45;
      ctx.beginPath();
      ctx.arc(
        x + moduleSize / 2,
        y + moduleSize / 2,
        dotRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    case "classy":
      const inset = moduleSize * 0.15;
      ctx.beginPath();
      ctx.moveTo(x + moduleSize / 2, y + inset);
      ctx.lineTo(x + moduleSize - inset, y + moduleSize / 2);
      ctx.lineTo(x + moduleSize / 2, y + moduleSize - inset);
      ctx.lineTo(x + inset, y + moduleSize / 2);
      ctx.closePath();
      ctx.fill();
      break;
  }
};

// Render finder pattern (the large corner squares) with custom corner style
const renderFinderPattern = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  moduleSize: number,
  cornerStyle: CornerType,
  fgColor: string,
  bgColor: string
): void => {
  const size7 = moduleSize * 7;
  const size5 = moduleSize * 5;
  const size3 = moduleSize * 3;

  const getRadius = (size: number): number => {
    switch (cornerStyle) {
      case "square":
        return 0;
      case "rounded":
        return size * 0.15;
      case "extra":
        return size * 0.35;
      case "dot":
        return size / 2;
    }
  };

  // Outer ring (7x7) - foreground
  ctx.fillStyle = fgColor;
  if (cornerStyle === "dot") {
    ctx.beginPath();
    ctx.arc(startX + size7 / 2, startY + size7 / 2, size7 / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(startX, startY, size7, size7, getRadius(size7));
    ctx.fill();
  }

  // Middle ring (5x5) - background (creates the gap)
  ctx.fillStyle = bgColor;
  const offset1 = moduleSize;
  if (cornerStyle === "dot") {
    ctx.beginPath();
    ctx.arc(startX + size7 / 2, startY + size7 / 2, size5 / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(
      startX + offset1,
      startY + offset1,
      size5,
      size5,
      getRadius(size5)
    );
    ctx.fill();
  }

  // Inner square (3x3) - foreground
  ctx.fillStyle = fgColor;
  const offset2 = moduleSize * 2;
  if (cornerStyle === "dot") {
    ctx.beginPath();
    ctx.arc(startX + size7 / 2, startY + size7 / 2, size3 / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(
      startX + offset2,
      startY + offset2,
      size3,
      size3,
      getRadius(size3)
    );
    ctx.fill();
  }
};

// Text label configuration interface
interface TextLabelConfig {
  textAbove: string;
  textBelow: string;
  fontSize: number;
  fontWeight: FontWeightType;
  fontFamily: FontFamilyType;
  textColor: string;
}

// Custom QR code rendering with pattern and corner support
const renderCustomQR = async (
  text: string,
  width: number,
  margin: number,
  fgColor: string,
  bgColor: string,
  errorLevel: ErrorLevelType,
  pattern: PatternType,
  cornerStyle: CornerType,
  textConfig?: TextLabelConfig
): Promise<string> => {
  const qr = QRCode.create(text, {
    errorCorrectionLevel: errorLevel,
  });

  const modules = qr.modules;
  const size = modules.size;
  const moduleSize = Math.floor((width - margin * 2) / size);
  const qrWidth = moduleSize * size + margin * 2;

  const scaleFactor = width / 1000;
  const basePadding = TEXT_PADDING * scaleFactor;
  const fontSize = textConfig ? textConfig.fontSize * scaleFactor : 0;

  let textAboveHeight = 0;
  let textBelowHeight = 0;

  if (textConfig?.textAbove) {
    textAboveHeight = fontSize + basePadding;
  }
  if (textConfig?.textBelow) {
    textBelowHeight = fontSize + basePadding;
  }

  const totalHeight = qrWidth + textAboveHeight + textBelowHeight;

  const canvas = document.createElement("canvas");
  canvas.width = qrWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, qrWidth, totalHeight);

  if (textConfig?.textAbove) {
    ctx.fillStyle = textConfig.textColor;
    ctx.font = `${textConfig.fontWeight} ${fontSize}px "${textConfig.fontFamily}", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const maxTextWidth = qrWidth - margin * 2;
    let displayText = textConfig.textAbove;
    let textWidth = ctx.measureText(displayText).width;
    if (textWidth > maxTextWidth) {
      while (textWidth > maxTextWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
        textWidth = ctx.measureText(displayText + "…").width;
      }
      displayText = displayText + "…";
    }

    ctx.fillText(displayText, qrWidth / 2, basePadding / 2);
  }

  const qrYOffset = textAboveHeight;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isFinderPattern(row, col, size)) continue;

      const isDark = modules.get(row, col);
      if (isDark) {
        const x = margin + col * moduleSize;
        const y = qrYOffset + margin + row * moduleSize;
        renderModule(ctx, x, y, moduleSize, pattern, fgColor);
      }
    }
  }

  // Draw finder patterns with custom corner style
  renderFinderPattern(
    ctx,
    margin,
    qrYOffset + margin,
    moduleSize,
    cornerStyle,
    fgColor,
    bgColor
  );
  renderFinderPattern(
    ctx,
    margin + (size - 7) * moduleSize,
    qrYOffset + margin,
    moduleSize,
    cornerStyle,
    fgColor,
    bgColor
  );
  renderFinderPattern(
    ctx,
    margin,
    qrYOffset + margin + (size - 7) * moduleSize,
    moduleSize,
    cornerStyle,
    fgColor,
    bgColor
  );

  if (textConfig?.textBelow) {
    ctx.fillStyle = textConfig.textColor;
    ctx.font = `${textConfig.fontWeight} ${fontSize}px "${textConfig.fontFamily}", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const maxTextWidth = qrWidth - margin * 2;
    let displayText = textConfig.textBelow;
    let textWidth = ctx.measureText(displayText).width;
    if (textWidth > maxTextWidth) {
      while (textWidth > maxTextWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
        textWidth = ctx.measureText(displayText + "…").width;
      }
      displayText = displayText + "…";
    }

    const textY = qrYOffset + qrWidth + basePadding / 2;
    ctx.fillText(displayText, qrWidth / 2, textY);
  }

  return canvas.toDataURL("image/png");
};

// Helper function to escape XML special characters
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// Generate custom SVG with pattern and corner support
const renderCustomSVG = (
  text: string,
  fgColor: string,
  bgColor: string,
  errorLevel: ErrorLevelType,
  pattern: PatternType,
  cornerStyle: CornerType,
  textConfig?: TextLabelConfig
): string => {
  const qr = QRCode.create(text, {
    errorCorrectionLevel: errorLevel,
  });

  const modules = qr.modules;
  const size = modules.size;
  const margin = 2;
  const moduleSize = 10;
  const qrSize = size * moduleSize + margin * 2 * moduleSize;

  const svgFontSize = textConfig ? textConfig.fontSize * 0.6 : 0;
  const svgPadding = TEXT_PADDING * 0.6;

  let textAboveHeight = 0;
  let textBelowHeight = 0;

  if (textConfig?.textAbove) {
    textAboveHeight = svgFontSize + svgPadding;
  }
  if (textConfig?.textBelow) {
    textBelowHeight = svgFontSize + svgPadding;
  }

  const totalHeight = qrSize + textAboveHeight + textBelowHeight;
  const totalSize = qrSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalHeight}" width="${totalSize}" height="${totalHeight}">`;

  svg += `<rect width="${totalSize}" height="${totalHeight}" fill="${bgColor}"/>`;

  if (textConfig?.textAbove) {
    const textY = textAboveHeight / 2 + svgFontSize / 3;
    svg += `<text x="${totalSize / 2}" y="${textY}" font-family="${textConfig.fontFamily}, sans-serif" font-size="${svgFontSize}" font-weight="${textConfig.fontWeight}" fill="${textConfig.textColor}" text-anchor="middle">${escapeXml(textConfig.textAbove)}</text>`;
  }

  const qrYOffset = textAboveHeight;

  const getModulePath = (
    x: number,
    y: number,
    s: number,
    pat: PatternType
  ): string => {
    switch (pat) {
      case "square":
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fgColor}"/>`;
      case "rounded":
        const r = s * 0.3;
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="${fgColor}"/>`;
      case "dots":
        const cx = x + s / 2;
        const cy = y + s / 2;
        const dr = s * 0.45;
        return `<circle cx="${cx}" cy="${cy}" r="${dr}" fill="${fgColor}"/>`;
      case "classy":
        const inset = s * 0.15;
        const points = [
          `${x + s / 2},${y + inset}`,
          `${x + s - inset},${y + s / 2}`,
          `${x + s / 2},${y + s - inset}`,
          `${x + inset},${y + s / 2}`,
        ].join(" ");
        return `<polygon points="${points}" fill="${fgColor}"/>`;
    }
  };

  const getFinderRadius = (s: number, style: CornerType): number => {
    switch (style) {
      case "square":
        return 0;
      case "rounded":
        return s * 0.15;
      case "extra":
        return s * 0.35;
      case "dot":
        return s / 2;
    }
  };

  const drawFinderSVG = (startX: number, startY: number): string => {
    const s7 = moduleSize * 7;
    const s5 = moduleSize * 5;
    const s3 = moduleSize * 3;
    let result = "";

    if (cornerStyle === "dot") {
      const cx = startX + s7 / 2;
      const cy = startY + s7 / 2;
      result += `<circle cx="${cx}" cy="${cy}" r="${s7 / 2}" fill="${fgColor}"/>`;
      result += `<circle cx="${cx}" cy="${cy}" r="${s5 / 2}" fill="${bgColor}"/>`;
      result += `<circle cx="${cx}" cy="${cy}" r="${s3 / 2}" fill="${fgColor}"/>`;
    } else {
      const r7 = getFinderRadius(s7, cornerStyle);
      const r5 = getFinderRadius(s5, cornerStyle);
      const r3 = getFinderRadius(s3, cornerStyle);
      result += `<rect x="${startX}" y="${startY}" width="${s7}" height="${s7}" rx="${r7}" fill="${fgColor}"/>`;
      result += `<rect x="${startX + moduleSize}" y="${startY + moduleSize}" width="${s5}" height="${s5}" rx="${r5}" fill="${bgColor}"/>`;
      result += `<rect x="${startX + moduleSize * 2}" y="${startY + moduleSize * 2}" width="${s3}" height="${s3}" rx="${r3}" fill="${fgColor}"/>`;
    }
    return result;
  };

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isFinderPattern(row, col, size)) continue;

      const isDark = modules.get(row, col);
      if (isDark) {
        const x = margin * moduleSize + col * moduleSize;
        const y = qrYOffset + margin * moduleSize + row * moduleSize;
        svg += getModulePath(x, y, moduleSize, pattern);
      }
    }
  }

  svg += drawFinderSVG(margin * moduleSize, qrYOffset + margin * moduleSize);
  svg += drawFinderSVG(
    margin * moduleSize + (size - 7) * moduleSize,
    qrYOffset + margin * moduleSize
  );
  svg += drawFinderSVG(
    margin * moduleSize,
    qrYOffset + margin * moduleSize + (size - 7) * moduleSize
  );

  if (textConfig?.textBelow) {
    const textY = qrYOffset + qrSize + svgFontSize;
    svg += `<text x="${totalSize / 2}" y="${textY}" font-family="${textConfig.fontFamily}, sans-serif" font-size="${svgFontSize}" font-weight="${textConfig.fontWeight}" fill="${textConfig.textColor}" text-anchor="middle">${escapeXml(textConfig.textBelow)}</text>`;
  }

  svg += "</svg>";
  return svg;
};

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

function EditPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // QR code data from database
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanData, setScanData] = useState<ScanData[]>([]);

  // Check for refresh param (post-payment)
  const shouldRefresh = searchParams.get("refresh") === "true";

  // Form state
  const [url, setUrl] = useState("");
  const [urlValid, setUrlValid] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [saving, setSaving] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Content type state for WiFi and Contact forms
  const [selectedContentType, setSelectedContentType] = useState<
    "url" | "wifi" | "vcard" | null
  >(null);
  const [wifiData, setWifiData] = useState<WiFiFormData>(initialWiFiData);
  const [contactData, setContactData] =
    useState<ContactFormData>(initialContactData);

  // Customization options
  const [fgColor, setFgColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [pattern, setPattern] = useState<PatternType>("square");
  const [cornerStyle, setCornerStyle] = useState<CornerType>("square");
  const [errorLevel, setErrorLevel] = useState<ErrorLevelType>("M");
  const [exportFormat, setExportFormat] = useState<FormatType>("png");
  const [exportResolution, setExportResolution] = useState<number>(1000);
  const [dpi, setDpi] = useState<DpiType>(300);

  // Text label options
  const [textAbove, setTextAbove] = useState("");
  const [textBelow, setTextBelow] = useState("");
  const [textFontSize, setTextFontSize] = useState(20);
  const [textFontWeight, setTextFontWeight] =
    useState<FontWeightType>("normal");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [textFontFamily, setTextFontFamily] = useState<FontFamilyType>("Arial");

  // Toast state
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const toastIdRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up refresh param from URL after processing
  useEffect(() => {
    if (shouldRefresh) {
      router.replace(`/edit/${id}`);
    }
  }, [shouldRefresh, id, router]);

  // Fetch QR code data from Supabase
  const fetchQRCode = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching QR code:", error);
      router.push("/dashboard");
      return;
    }

    setQrCode(data);
    setUrl(data.destination_url);
    setUrlValid(true);
    setGeneratedUrl(data.destination_url);

    // Pre-fill customization from qr_data if present
    if (data.qr_data) {
      const qrData = data.qr_data as QRCustomizationData;
      if (qrData.foreground_color) setFgColor(qrData.foreground_color);
      if (qrData.background_color) setBgColor(qrData.background_color);
      if (qrData.pattern) setPattern(qrData.pattern as PatternType);
      if (qrData.corner_style)
        setCornerStyle(qrData.corner_style as CornerType);
      if (qrData.error_level)
        setErrorLevel(qrData.error_level as ErrorLevelType);
      if (qrData.text_above) setTextAbove(qrData.text_above);
      if (qrData.text_below) setTextBelow(qrData.text_below);
      if (qrData.text_font_size) setTextFontSize(qrData.text_font_size);
      if (qrData.text_font_weight)
        setTextFontWeight(qrData.text_font_weight as FontWeightType);
      if (qrData.text_font_family)
        setTextFontFamily(qrData.text_font_family as FontFamilyType);
      if (qrData.text_color) setTextColor(qrData.text_color);
    }

    // Fetch scan analytics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: scans } = await supabase
      .from("qr_scans")
      .select("scanned_at")
      .eq("qr_code_id", id)
      .gte("scanned_at", sevenDaysAgo.toISOString())
      .order("scanned_at", { ascending: true });

    // Aggregate scans by day
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const scansByDay: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      scansByDay[dayName] = 0;
    }

    if (scans) {
      scans.forEach((scan) => {
        const date = new Date(scan.scanned_at);
        const dayName = days[date.getDay()];
        scansByDay[dayName] = (scansByDay[dayName] || 0) + 1;
      });
    }

    setScanData(
      Object.entries(scansByDay).map(([day, count]) => ({ day, count }))
    );
    setLoading(false);
  }, [id, supabase, router]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode, shouldRefresh]);

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

  // URL/Content validation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateURL = useCallback(
    debounce((value: string) => {
      if (!value.trim()) {
        setUrlValid(false);
        return;
      }

      const trimmedValue = value.trim();

      const specialProtocols = [
        "WIFI:",
        "wifi:",
        "BEGIN:VCARD",
        "BEGIN:VCALENDAR",
        "sms:",
        "tel:",
        "mailto:",
        "geo:",
      ];

      const isSpecialContent = specialProtocols.some((protocol) =>
        trimmedValue.startsWith(protocol)
      );

      if (isSpecialContent) {
        setUrlValid(true);
        return;
      }

      try {
        new URL(trimmedValue);
        setUrlValid(true);
      } catch {
        try {
          new URL("https://" + trimmedValue);
          setUrlValid(true);
        } catch {
          setUrlValid(false);
        }
      }
    }, 300),
    []
  );

  // Show toast notification
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { message, type, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  // Helper to get text label configuration
  const getTextConfig = useCallback((): TextLabelConfig | undefined => {
    if (!textAbove && !textBelow) return undefined;
    return {
      textAbove,
      textBelow,
      fontSize: textFontSize,
      fontWeight: textFontWeight,
      fontFamily: textFontFamily,
      textColor,
    };
  }, [
    textAbove,
    textBelow,
    textFontSize,
    textFontWeight,
    textFontFamily,
    textColor,
  ]);

  // Generate QR code
  const generateQR = useCallback(async () => {
    if (!url.trim()) return;

    let processedUrl = url.trim();
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://") &&
      !processedUrl.startsWith("WIFI:") &&
      !processedUrl.startsWith("wifi:") &&
      !processedUrl.startsWith("BEGIN:") &&
      !processedUrl.startsWith("mailto:") &&
      !processedUrl.startsWith("sms:") &&
      !processedUrl.startsWith("tel:") &&
      !processedUrl.startsWith("geo:")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    setIsGenerating(true);

    try {
      const dataUrl = await renderCustomQR(
        processedUrl,
        exportResolution,
        Math.round(exportResolution * 0.02),
        fgColor,
        bgColor,
        errorLevel,
        pattern,
        cornerStyle,
        getTextConfig()
      );
      setQrDataUrl(dataUrl);
      setGeneratedUrl(processedUrl);
    } catch {
      showToast("Failed to generate QR code", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [
    url,
    exportResolution,
    fgColor,
    bgColor,
    errorLevel,
    pattern,
    cornerStyle,
    showToast,
    getTextConfig,
  ]);

  // Handle template selection
  const setTemplate = (templateId: string) => {
    if (templateId === "wifi") {
      setSelectedContentType("wifi");
      setWifiData(initialWiFiData);
      setUrl("");
      setUrlValid(false);
      return;
    }

    if (templateId === "vcard") {
      setSelectedContentType("vcard");
      setContactData(initialContactData);
      setUrl("");
      setUrlValid(false);
      return;
    }

    setSelectedContentType("url");
    const template = QUICK_ACTIONS.find((a) => a.id === templateId);
    if (template) {
      setUrl(template.template);
      validateURL(template.template);
    }
  };

  // Handle WiFi form changes
  const handleWifiChange = useCallback((data: WiFiFormData) => {
    setWifiData(data);
    const wifiString = generateWiFiString(data);
    if (wifiString) {
      setUrl(wifiString);
      setUrlValid(true);
    } else {
      setUrl("");
      setUrlValid(false);
    }
  }, []);

  // Handle Contact form changes
  const handleContactChange = useCallback((data: ContactFormData) => {
    setContactData(data);
    const vcardString = generateVCardString(data);
    const hasContent =
      data.firstName || data.lastName || data.phone || data.email;
    if (hasContent) {
      setUrl(vcardString);
      setUrlValid(true);
    } else {
      setUrl("");
      setUrlValid(false);
    }
  }, []);

  // Reset to URL mode
  const resetToUrlMode = () => {
    setSelectedContentType(null);
    setUrl(qrCode?.destination_url || "");
    setUrlValid(true);
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
    const cleanValue = value.toUpperCase();
    if (isValidHex(cleanValue)) {
      setter(normalizeHex(cleanValue));
    }
  };

  // Handle resolution slider with snap behavior
  const handleResolutionChange = (value: number) => {
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
  const generateSvgString = useCallback((): string => {
    return renderCustomSVG(
      generatedUrl,
      fgColor,
      bgColor,
      errorLevel,
      pattern,
      cornerStyle,
      getTextConfig()
    );
  }, [
    generatedUrl,
    fgColor,
    bgColor,
    errorLevel,
    pattern,
    cornerStyle,
    getTextConfig,
  ]);

  // Generate EPS from SVG
  const generateEpsString = useCallback((): string => {
    const svgString = generateSvgString();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");
    const width = parseInt(svgElement?.getAttribute("width") || "100", 10);
    const height = parseInt(svgElement?.getAttribute("height") || "100", 10);

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

    const bgRgb = hexToRgbNormalized(bgColor);
    const fgRgb = hexToRgbNormalized(fgColor);

    let epsBody = `% Background
${bgRgb.r} ${bgRgb.g} ${bgRgb.b} rgb
0 0 ${width} ${height} rect f
`;

    const rects = svgDoc.querySelectorAll("rect");
    rects.forEach((rect, index) => {
      if (index === 0) return;
      const fill = rect.getAttribute("fill");
      const rgb = fill === bgColor ? bgRgb : fgRgb;
      const x = parseFloat(rect.getAttribute("x") || "0");
      const y = parseFloat(rect.getAttribute("y") || "0");
      const w = parseFloat(rect.getAttribute("width") || "0");
      const h = parseFloat(rect.getAttribute("height") || "0");
      const psY = height - y - h;
      epsBody += `${rgb.r} ${rgb.g} ${rgb.b} rgb\n`;
      epsBody += `${x} ${psY} ${w} ${h} rect f\n`;
    });

    const circles = svgDoc.querySelectorAll("circle");
    circles.forEach((circle) => {
      const fill = circle.getAttribute("fill");
      const rgb = fill === bgColor ? bgRgb : fgRgb;
      const cx = parseFloat(circle.getAttribute("cx") || "0");
      const cy = parseFloat(circle.getAttribute("cy") || "0");
      const r = parseFloat(circle.getAttribute("r") || "0");
      const psCy = height - cy;
      epsBody += `${rgb.r} ${rgb.g} ${rgb.b} rgb\n`;
      epsBody += `newpath ${cx} ${psCy} ${r} 0 360 arc closepath f\n`;
    });

    const polygons = svgDoc.querySelectorAll("polygon");
    polygons.forEach((polygon) => {
      const fill = polygon.getAttribute("fill");
      const rgb = fill === bgColor ? bgRgb : fgRgb;
      const points = polygon.getAttribute("points") || "";
      const coords = points.split(" ").map((p) => {
        const [x, y] = p.split(",").map(parseFloat);
        return { x, y: height - y };
      });
      if (coords.length > 0) {
        epsBody += `${rgb.r} ${rgb.g} ${rgb.b} rgb\n`;
        epsBody += `newpath\n`;
        epsBody += `${coords[0].x} ${coords[0].y} m\n`;
        for (let i = 1; i < coords.length; i++) {
          epsBody += `${coords[i].x} ${coords[i].y} l\n`;
        }
        epsBody += `closepath f\n`;
      }
    });

    const epsFooter = `grestore
showpage
%%EOF
`;

    return epsHeader + epsBody + epsFooter;
  }, [generateSvgString, bgColor, fgColor]);

  // Download QR code at specified resolution
  const downloadQR = useCallback(async () => {
    if (!generatedUrl) return;

    setIsGenerating(true);
    try {
      const formatInfo = FORMAT_INFO[exportFormat];

      switch (exportFormat) {
        case "png": {
          const dataUrl = await renderCustomQR(
            generatedUrl,
            exportResolution,
            Math.round(exportResolution * 0.02),
            fgColor,
            bgColor,
            errorLevel,
            pattern,
            cornerStyle,
            getTextConfig()
          );

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
          const svgString = generateSvgString();

          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const urlBlob = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = urlBlob;
          link.download = "qr-code.svg";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(urlBlob);
          showToast("SVG downloaded (vector format)!", "success");
          break;
        }

        case "pdf": {
          const pngDataUrl = await renderCustomQR(
            generatedUrl,
            1000,
            20,
            fgColor,
            bgColor,
            errorLevel,
            pattern,
            cornerStyle,
            getTextConfig()
          );

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const pageWidth = 210;
          const pageHeight = 297;
          const textConfigPdf = getTextConfig();
          const hasText =
            textConfigPdf &&
            (textConfigPdf.textAbove || textConfigPdf.textBelow);
          const qrSize = 100;
          const heightRatio = hasText ? 1.15 : 1;
          const qrHeight = qrSize * heightRatio;
          const x = (pageWidth - qrSize) / 2;
          const y = (pageHeight - qrHeight) / 2;

          pdf.addImage(pngDataUrl, "PNG", x, y, qrSize, qrHeight);

          pdf.save("qr-code.pdf");
          showToast("PDF downloaded (print-ready)!", "success");
          break;
        }

        case "eps": {
          const epsString = generateEpsString();

          const blob = new Blob([epsString], {
            type: "application/postscript",
          });
          const urlBlob = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = urlBlob;
          link.download = "qr-code.eps";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(urlBlob);
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
    pattern,
    cornerStyle,
    showToast,
    generateSvgString,
    generateEpsString,
    getTextConfig,
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

  // Save customizations to database via API (bypasses RLS for qr_data)
  const saveCustomizations = useCallback(async () => {
    if (!qrCode) return;

    setSaving(true);
    try {
      const qrData: QRCustomizationData = {
        foreground_color: fgColor,
        background_color: bgColor,
        pattern,
        corner_style: cornerStyle,
        error_level: errorLevel,
        text_above: textAbove || undefined,
        text_below: textBelow || undefined,
        text_font_size: textFontSize,
        text_font_weight: textFontWeight,
        text_font_family: textFontFamily,
        text_color: textColor,
      };

      const updateData: {
        qr_data: QRCustomizationData;
        destination_url?: string;
      } = {
        qr_data: qrData,
      };

      // Only update destination_url if editable and URL changed
      if (qrCode.is_editable && url !== qrCode.destination_url) {
        updateData.destination_url = url;
      }

      const response = await fetch(`/api/qr/${qrCode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error saving customizations:", result.error);
        showToast(result.error || "Failed to save changes", "error");
      } else {
        showToast("Changes saved!", "success");
        // Update local state
        setQrCode((prev) =>
          prev
            ? {
                ...prev,
                qr_data: qrData,
                destination_url:
                  updateData.destination_url || prev.destination_url,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error saving:", error);
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }, [
    qrCode,
    fgColor,
    bgColor,
    pattern,
    cornerStyle,
    errorLevel,
    textAbove,
    textBelow,
    textFontSize,
    textFontWeight,
    textFontFamily,
    textColor,
    url,
    showToast,
  ]);

  // Handle unlock payment
  const handleUnlock = async () => {
    if (!qrCode) return;

    setProcessingPayment(true);

    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE;

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
        window.location.href = data.url;
      } else {
        showToast("Failed to start payment process", "error");
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      showToast("Failed to start payment process", "error");
      setProcessingPayment(false);
    }
  };

  // Auto-regenerate QR when options change
  useEffect(() => {
    if (!generatedUrl || !qrDataUrl) return;

    const regenerate = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await renderCustomQR(
          generatedUrl,
          exportResolution,
          Math.round(exportResolution * 0.02),
          fgColor,
          bgColor,
          errorLevel,
          pattern,
          cornerStyle,
          getTextConfig()
        );
        setQrDataUrl(dataUrl);
      } catch {
        showToast("Failed to regenerate QR code", "error");
      } finally {
        setIsGenerating(false);
      }
    };

    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fgColor,
    bgColor,
    exportResolution,
    errorLevel,
    pattern,
    cornerStyle,
    textAbove,
    textBelow,
    textFontSize,
    textFontWeight,
    textColor,
    textFontFamily,
  ]);

  // Initial QR generation
  useEffect(() => {
    if (url && urlValid) {
      generateQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-regenerate QR when URL/content input changes (debounced)
  useEffect(() => {
    if (!url.trim() || !urlValid) return;

    const timer = setTimeout(() => {
      generateQR();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, urlValid]);

  // Icon component
  const Icon = ({
    name,
    className = "w-4 h-4",
  }: {
    name: string;
    className?: string;
  }) => {
    const icons: Record<string, JSX.Element> = {
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
      lock: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      unlock: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      ),
      chart: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      ),
      "arrow-left": (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      ),
    };
    return icons[name] || null;
  };

  // Analytics data
  const maxScanCount = Math.max(...scanData.map((d) => d.count), 1);
  const weeklyScans = scanData.reduce((sum, d) => sum + d.count, 0);
  const avgScans = (weeklyScans / 7).toFixed(1);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--pro-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
          <p className="text-[var(--muted)]">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--pro-bg)]">
        <div className="text-center">
          <p className="text-[var(--muted)]">QR code not found</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-[var(--accent)]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if content/analytics tabs are locked
  const isLocked = !qrCode.is_editable;

  // Render locked content tab
  const renderLockedContent = () => (
    <div className="p-4 sm:p-5">
      {/* Current URL Display */}
      <div className="mb-4 rounded-lg bg-[var(--pro-surface-hover)] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--pro-muted)] sm:text-[11px]">
          Current destination
        </div>
        <div className="mt-1 break-all text-sm text-[var(--pro-fg)]">
          {qrCode.destination_url}
        </div>
      </div>

      {/* Lock Message */}
      <div className="mb-4 rounded-xl border-2 border-dashed border-[var(--pro-border)] bg-[var(--pro-surface-hover)] p-5 text-center sm:mb-6 sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pro-accent-light)]">
          <Icon name="lock" className="h-8 w-8 text-[var(--pro-accent)]" />
        </div>
        <h3 className="mb-2 font-serif text-lg text-[var(--pro-fg)] sm:text-xl">
          Unlock Editing
        </h3>
        <p className="mb-3 text-sm text-[var(--pro-muted)] sm:mb-4">
          Change where this QR code redirects anytime.
        </p>
      </div>

      {/* Pricing */}
      <div className="mb-4 rounded-xl border-2 border-[var(--pro-accent)] bg-[var(--pro-accent-light)] p-4 text-center sm:mb-6 sm:p-6">
        <div className="font-serif text-3xl text-[var(--pro-fg)] sm:text-4xl">
          $1.99
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--pro-fg)]">
          One-time payment
        </div>
        <div className="mt-2 text-xs text-[var(--pro-muted)]">
          Unlock editing and analytics for this QR code forever
        </div>
      </div>

      {/* Unlock Button */}
      <button
        onClick={handleUnlock}
        disabled={processingPayment}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pro-accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] hover:shadow-lg disabled:translate-y-0 disabled:opacity-70"
      >
        {processingPayment ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <Icon name="unlock" className="h-5 w-5" />
            Unlock for $1.99
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--pro-muted)]">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Secure payment via Stripe
      </div>
    </div>
  );

  // Render locked analytics tab
  const renderLockedAnalytics = () => (
    <div className="p-4 sm:p-5">
      {/* Blurred placeholder */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-[var(--pro-surface-hover)] p-6">
        <div className="pointer-events-none blur-sm">
          <div className="mb-4 h-32 rounded-lg bg-[var(--pro-border)]"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 rounded-lg bg-[var(--pro-border)]"></div>
            <div className="h-16 rounded-lg bg-[var(--pro-border)]"></div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon
              name="lock"
              className="mx-auto mb-2 h-8 w-8 text-[var(--pro-accent)]"
            />
            <p className="text-sm font-medium text-[var(--pro-fg)]">
              Analytics Locked
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 rounded-xl border-2 border-[var(--pro-accent)] bg-[var(--pro-accent-light)] p-4 text-center sm:mb-6 sm:p-6">
        <div className="font-serif text-3xl text-[var(--pro-fg)] sm:text-4xl">
          $1.99
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--pro-fg)]">
          One-time payment
        </div>
        <div className="mt-2 text-xs text-[var(--pro-muted)]">
          Unlock editing and analytics for this QR code forever
        </div>
      </div>

      {/* Unlock Button */}
      <button
        onClick={handleUnlock}
        disabled={processingPayment}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pro-accent)] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500] hover:shadow-lg disabled:translate-y-0 disabled:opacity-70"
      >
        {processingPayment ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <Icon name="unlock" className="h-5 w-5" />
            Unlock for $1.99
          </>
        )}
      </button>
    </div>
  );

  // Render unlocked analytics tab
  const renderAnalyticsTab = () => (
    <div className="p-4 sm:p-5">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-[var(--pro-surface-hover)] p-4 text-center">
          <div className="font-serif text-2xl text-[var(--pro-fg)]">
            {qrCode.scan_count}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)]">
            Total Scans
          </div>
        </div>
        <div className="rounded-xl bg-[var(--pro-surface-hover)] p-4 text-center">
          <div className="font-serif text-2xl text-[var(--pro-fg)]">
            {weeklyScans}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)]">
            This Week
          </div>
        </div>
        <div className="rounded-xl bg-[var(--pro-surface-hover)] p-4 text-center">
          <div className="font-serif text-2xl text-[var(--pro-fg)]">
            {avgScans}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)]">
            Avg/Day
          </div>
        </div>
        <div className="rounded-xl bg-[var(--pro-surface-hover)] p-4 text-center">
          <div className="font-serif text-2xl text-[var(--pro-fg)]">
            {qrCode.is_editable ? "1+" : "-"}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--pro-muted)]">
            Total Edits
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-[var(--pro-fg)]">
          Last 7 Days
        </h4>
        <div className="h-40 overflow-hidden rounded-xl bg-[var(--pro-surface-hover)]">
          <div className="flex h-full items-end justify-between gap-2 px-6 py-4">
            {scanData.map(({ day, count }) => (
              <div
                key={day}
                className="flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full max-w-10 rounded-t bg-[var(--pro-accent)] transition-all hover:bg-[#e64500]"
                  style={{
                    height: `${Math.max((count / maxScanCount) * 100, 5)}%`,
                    minHeight: "8px",
                  }}
                />
                <span className="text-[10px] uppercase text-[var(--pro-muted)]">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Full Analytics Link */}
      <Link
        href={`/dashboard/${qrCode.id}`}
        className="flex items-center justify-center gap-2 rounded-lg border border-[var(--pro-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--pro-fg)] transition-colors hover:border-[var(--pro-accent)] hover:text-[var(--pro-accent)]"
      >
        <Icon name="chart" className="h-4 w-4" />
        View Full Analytics
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--pro-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--pro-border)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-[var(--pro-muted)] transition-colors hover:text-[var(--pro-accent)]"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-[var(--pro-border)]" />
            <h1 className="font-serif text-lg text-[var(--pro-fg)] sm:text-xl">
              Edit: {qrCode.title}
            </h1>
          </div>
          <button
            onClick={saveCustomizations}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[var(--pro-accent)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#e64500] disabled:opacity-70"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Icon name="check" className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1400px] px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6 xl:grid-cols-[1fr_420px]">
          {/* Configuration Panel */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {/* Customization Panel with Tabs */}
            <div className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)]">
              {/* Tabs */}
              <div className="border-b border-[var(--pro-border)] px-3 sm:px-5">
                <div className="scrollbar-hide -mb-px flex overflow-x-auto">
                  {(
                    [
                      "content",
                      "labels",
                      "colors",
                      "style",
                      "export",
                      "analytics",
                    ] as TabType[]
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-4 sm:py-3.5 sm:text-sm ${
                        activeTab === tab
                          ? "border-[var(--pro-accent)] text-[var(--pro-accent)]"
                          : "border-transparent text-[var(--pro-muted)] hover:text-[var(--pro-fg)]"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {/* Lock icon for locked tabs */}
                      {isLocked &&
                        (tab === "content" || tab === "analytics") && (
                          <Icon
                            name="lock"
                            className="ml-1 inline-block h-3 w-3 text-[var(--pro-muted)]"
                          />
                        )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === "content" &&
                (isLocked ? (
                  renderLockedContent()
                ) : (
                  <div className="p-4 sm:p-5">
                    {/* WiFi Form */}
                    {selectedContentType === "wifi" && (
                      <div>
                        <button
                          onClick={resetToUrlMode}
                          className="mb-4 flex items-center gap-1.5 text-xs text-[var(--pro-muted)] transition-colors hover:text-[var(--pro-accent)]"
                        >
                          <Icon name="arrow-left" className="h-3.5 w-3.5" />
                          Back to content selection
                        </button>
                        <WiFiForm data={wifiData} onChange={handleWifiChange} />
                      </div>
                    )}

                    {/* Contact/vCard Form */}
                    {selectedContentType === "vcard" && (
                      <div>
                        <button
                          onClick={resetToUrlMode}
                          className="mb-4 flex items-center gap-1.5 text-xs text-[var(--pro-muted)] transition-colors hover:text-[var(--pro-accent)]"
                        >
                          <Icon name="arrow-left" className="h-3.5 w-3.5" />
                          Back to content selection
                        </button>
                        <ContactForm
                          data={contactData}
                          onChange={handleContactChange}
                        />
                      </div>
                    )}

                    {/* Default URL/Text Input */}
                    {selectedContentType !== "wifi" &&
                      selectedContentType !== "vcard" && (
                        <>
                          <div className="mb-4 sm:mb-5">
                            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--pro-fg)]">
                              Destination URL{" "}
                              <span className="text-[var(--pro-error)]">*</span>
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pro-muted)]">
                                <Icon
                                  name="globe"
                                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                                />
                              </div>
                              <input
                                type="url"
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
                                    <span className="xs:inline hidden">
                                      {urlValid ? "Valid" : "Invalid"}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="mt-1.5 text-[10px] text-[var(--pro-muted)] sm:text-xs">
                              Enter a URL, text, or use one of the quick actions
                              below
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
                        </>
                      )}
                  </div>
                ))}

              {/* Labels Tab */}
              {activeTab === "labels" && (
                <div className="p-4 sm:p-5">
                  {/* Text Above */}
                  <div className="mb-4 sm:mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Text Above QR
                      <span className="ml-1 font-normal text-[var(--pro-muted)]">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={textAbove}
                      onChange={(e) => setTextAbove(e.target.value)}
                      placeholder="e.g., Scan me!"
                      className="w-full rounded-md border border-[var(--pro-border)] px-3 py-2.5 text-sm outline-none transition-all focus:border-[var(--pro-accent)] focus:shadow-[0_0_0_3px_var(--pro-accent-light)]"
                    />
                  </div>

                  {/* Text Below */}
                  <div className="mb-4 sm:mb-5">
                    <label className="mb-2 block text-xs font-semibold">
                      Text Below QR
                      <span className="ml-1 font-normal text-[var(--pro-muted)]">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={textBelow}
                      onChange={(e) => setTextBelow(e.target.value)}
                      placeholder="e.g., Visit our website"
                      className="w-full rounded-md border border-[var(--pro-border)] px-3 py-2.5 text-sm outline-none transition-all focus:border-[var(--pro-accent)] focus:shadow-[0_0_0_3px_var(--pro-accent-light)]"
                    />
                  </div>

                  {/* Text Styling - only show if text is entered */}
                  {(textAbove || textBelow) && (
                    <>
                      {/* Font Size Slider */}
                      <div className="mb-4 sm:mb-5">
                        <label className="mb-2 flex items-center justify-between text-xs font-semibold">
                          <span>Font Size</span>
                          <span className="font-normal text-[var(--pro-muted)]">
                            {textFontSize}px
                          </span>
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="32"
                          step="1"
                          value={textFontSize}
                          onChange={(e) =>
                            setTextFontSize(Number(e.target.value))
                          }
                          className="w-full cursor-pointer accent-[var(--pro-accent)]"
                        />
                        <div className="mt-1 flex justify-between text-[10px] text-[var(--pro-muted)]">
                          <span>12px</span>
                          <span>32px</span>
                        </div>
                      </div>

                      {/* Font Weight */}
                      <div className="mb-4 sm:mb-5">
                        <label className="mb-2 block text-xs font-semibold">
                          Font Weight
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {FONT_WEIGHT_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setTextFontWeight(option.value)}
                              className={`rounded-md border p-2 text-center text-xs font-medium transition-all ${
                                textFontWeight === option.value
                                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)] text-[var(--pro-accent)]"
                                  : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                              }`}
                              style={{
                                fontWeight:
                                  option.value === "500" ? 500 : option.value,
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Family */}
                      <div className="mb-4 sm:mb-5">
                        <label className="mb-2 block text-xs font-semibold">
                          Font Family
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {FONT_FAMILY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setTextFontFamily(option.value)}
                              className={`rounded-md border p-2 text-center text-xs transition-all ${
                                textFontFamily === option.value
                                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)] text-[var(--pro-accent)]"
                                  : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
                              }`}
                              style={{ fontFamily: option.value }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Color */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <div
                            className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[var(--pro-border)]"
                            style={{ backgroundColor: textColor }}
                          >
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={textColor.toUpperCase()}
                            onChange={(e) =>
                              handleHexInput(e.target.value, setTextColor)
                            }
                            onBlur={(e) => {
                              if (!isValidHex(e.target.value)) {
                                setTextColor("#1a1a1a");
                              }
                            }}
                            className="flex-1 rounded-md border border-[var(--pro-border)] px-3 py-2 font-mono text-sm uppercase focus:border-[var(--pro-accent)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === "colors" && (
                <div className="p-4 sm:p-5">
                  <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
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
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
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
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
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
                  {/* Export Format */}
                  <div className="mb-4 sm:mb-6">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)] sm:mb-3">
                      Export Format
                    </label>

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
                              <div className="text-sm font-bold text-[var(--pro-fg)] sm:text-base">
                                {info.label}
                              </div>
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

                    {/* Format Info */}
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-[var(--pro-accent-light)] p-3">
                      <p className="text-xs text-[var(--pro-accent)]">
                        <strong>{FORMAT_INFO[exportFormat].label}</strong> -{" "}
                        {FORMAT_INFO[exportFormat].tip}
                      </p>
                    </div>
                  </div>

                  {/* Resolution controls for PNG only */}
                  {!FORMAT_INFO[exportFormat].isVector && (
                    <div className="mb-6 rounded-xl border border-[var(--pro-border)] bg-gradient-to-br from-[var(--pro-surface)] to-[var(--pro-surface-hover)] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-[var(--pro-fg)]">
                          Resolution
                        </label>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-[var(--pro-accent)]">
                            {exportResolution}
                          </span>
                          <span className="text-lg text-[var(--pro-muted)]">
                            px
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="200"
                        max="2000"
                        step="1"
                        value={exportResolution}
                        onChange={(e) =>
                          handleResolutionChange(Number(e.target.value))
                        }
                        className="w-full cursor-pointer accent-[var(--pro-accent)]"
                      />
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={downloadQR}
                    disabled={isGenerating || !generatedUrl}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--pro-accent)] py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--pro-accent-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[var(--pro-muted-light)]"
                  >
                    <Icon name="download" className="h-5 w-5" />
                    {FORMAT_INFO[exportFormat].isVector
                      ? `Download ${FORMAT_INFO[exportFormat].label}`
                      : `Download ${FORMAT_INFO[exportFormat].label} (${exportResolution}px)`}
                  </button>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" &&
                (isLocked ? renderLockedAnalytics() : renderAnalyticsTab())}
            </div>
          </div>

          {/* Preview Panel */}
          <aside className="order-1 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)] lg:sticky lg:top-20 lg:order-2">
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
                    src={qrDataUrl}
                    alt={`QR code for ${qrCode.title}`}
                    className="h-[140px] w-[140px] transition-transform sm:h-[200px] sm:w-[200px]"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                ) : (
                  <div className="flex h-[140px] w-[140px] items-center justify-center sm:h-[200px] sm:w-[200px]">
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
              <span className="min-w-[40px] text-center text-xs font-semibold sm:min-w-[50px] sm:text-sm">
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
                Copy URL
              </button>
              <button
                onClick={downloadQR}
                disabled={isGenerating || !qrDataUrl}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--pro-accent)] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e64500] disabled:cursor-not-allowed disabled:bg-[var(--pro-muted-light)] sm:gap-2 sm:py-2.5 sm:text-sm"
              >
                <Icon name="download" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Download
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${
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

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

// Loading component
function EditPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pro-bg)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    </div>
  );
}

// Main export with Suspense
export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditPageLoading />}>
      <EditPageContent params={params} />
    </Suspense>
  );
}
