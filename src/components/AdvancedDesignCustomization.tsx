"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import QRCode from "qrcode";

// Types
export type BodyPattern =
  | "square"
  | "dots"
  | "rounded"
  | "vertical"
  | "horizontal"
  | "diagonal";
export type EyeFrameStyle =
  | "square"
  | "rounded"
  | "circle"
  | "left-leaf"
  | "right-leaf";
export type EyeBallStyle = "square" | "rounded" | "circle" | "diamond";
export type GradientType = "solid" | "linear-h" | "linear-v" | "radial";
export type GradientDirection = "0deg" | "90deg" | "135deg" | "radial";

interface GradientSettings {
  type: GradientType;
  startColor: string;
  endColor: string;
  direction: GradientDirection;
  applyToBody: boolean;
  applyToEyeFrames: boolean;
  applyToEyeBalls: boolean;
}

export interface AdvancedDesignSettings {
  bodyPattern: BodyPattern;
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  gradient: GradientSettings;
}

// Pattern data
const BODY_PATTERNS: {
  id: BodyPattern;
  name: string;
  description: string;
}[] = [
  {
    id: "square",
    name: "Standard Squares",
    description: "Classic QR code look",
  },
  { id: "dots", name: "Circular Dots", description: "Modern & friendly" },
  { id: "rounded", name: "Rounded Squares", description: "Soft, approachable" },
  { id: "vertical", name: "Vertical Lines", description: "Tall & elegant" },
  { id: "horizontal", name: "Horizontal Lines", description: "Wide & stable" },
  { id: "diagonal", name: "Diagonal Lines", description: "Dynamic & unique" },
];

const EYE_FRAME_STYLES: { id: EyeFrameStyle; name: string }[] = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "circle", name: "Circle" },
  { id: "left-leaf", name: "Left Leaf" },
  { id: "right-leaf", name: "Right Leaf" },
];

const EYE_BALL_STYLES: { id: EyeBallStyle; name: string }[] = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "circle", name: "Circle" },
  { id: "diamond", name: "Diamond" },
];

const GRADIENT_TYPES: { id: GradientType; name: string }[] = [
  { id: "solid", name: "Solid" },
  { id: "linear-h", name: "Horizontal" },
  { id: "linear-v", name: "Vertical" },
  { id: "radial", name: "Radial" },
];

interface Props {
  url: string;
  onGenerate?: (dataUrl: string) => void;
  onSettingsChange?: (settings: AdvancedDesignSettings) => void;
}

const DEFAULT_SETTINGS: AdvancedDesignSettings = {
  bodyPattern: "dots",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  gradient: {
    type: "solid",
    startColor: "#1a1a1a",
    endColor: "#ff4d00",
    direction: "0deg",
    applyToBody: true,
    applyToEyeFrames: false,
    applyToEyeBalls: false,
  },
};

export default function AdvancedDesignCustomization({
  url,
  onGenerate,
  onSettingsChange,
}: Props) {
  const [settings, setSettings] =
    useState<AdvancedDesignSettings>(DEFAULT_SETTINGS);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate custom QR code with advanced styling
  const generateAdvancedQR = useCallback(async () => {
    if (!url.trim()) return;

    setIsGenerating(true);

    try {
      // Generate QR code matrix data
      const qrData = await QRCode.create(url, {
        errorCorrectionLevel: "H",
      });

      const modules = qrData.modules;
      const size = modules.size;
      const canvas = canvasRef.current;

      if (!canvas) return;

      const scale = 10; // Each module is 10x10 pixels
      const margin = 4; // Quiet zone
      const canvasSize = (size + margin * 2) * scale;

      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Get colors based on gradient settings
      const getColor = (
        target: "body" | "eyeFrame" | "eyeBall"
      ): string | CanvasGradient => {
        const { gradient } = settings;

        const shouldApplyGradient =
          (target === "body" && gradient.applyToBody) ||
          (target === "eyeFrame" && gradient.applyToEyeFrames) ||
          (target === "eyeBall" && gradient.applyToEyeBalls);

        if (!shouldApplyGradient || gradient.type === "solid") {
          return gradient.startColor;
        }

        let grad: CanvasGradient;

        if (gradient.type === "radial") {
          const center = canvasSize / 2;
          grad = ctx.createRadialGradient(
            center,
            center,
            0,
            center,
            center,
            canvasSize / 2
          );
        } else {
          const angle =
            gradient.type === "linear-h"
              ? 0
              : gradient.type === "linear-v"
                ? 90
                : parseInt(gradient.direction);

          const rad = (angle * Math.PI) / 180;
          const x1 = canvasSize / 2 - (Math.cos(rad) * canvasSize) / 2;
          const y1 = canvasSize / 2 - (Math.sin(rad) * canvasSize) / 2;
          const x2 = canvasSize / 2 + (Math.cos(rad) * canvasSize) / 2;
          const y2 = canvasSize / 2 + (Math.sin(rad) * canvasSize) / 2;

          grad = ctx.createLinearGradient(x1, y1, x2, y2);
        }

        grad.addColorStop(0, gradient.startColor);
        grad.addColorStop(1, gradient.endColor);

        return grad;
      };

      // Helper to check if a position is part of an eye pattern
      const isEyePosition = (row: number, col: number): boolean => {
        // Top-left eye
        if (row < 7 && col < 7) return true;
        // Top-right eye
        if (row < 7 && col >= size - 7) return true;
        // Bottom-left eye
        if (row >= size - 7 && col < 7) return true;
        return false;
      };

      // Helper to check if position is eye frame (outer ring)
      const isEyeFrame = (row: number, col: number): boolean => {
        // Check all three eye positions
        const eyePositions = [
          { startRow: 0, startCol: 0 },
          { startRow: 0, startCol: size - 7 },
          { startRow: size - 7, startCol: 0 },
        ];

        for (const eye of eyePositions) {
          const relRow = row - eye.startRow;
          const relCol = col - eye.startCol;

          if (relRow >= 0 && relRow < 7 && relCol >= 0 && relCol < 7) {
            // Outer ring (frame)
            if (relRow === 0 || relRow === 6 || relCol === 0 || relCol === 6) {
              return true;
            }
            // White ring
            if (relRow === 1 || relRow === 5 || relCol === 1 || relCol === 5) {
              return false;
            }
          }
        }
        return false;
      };

      // Helper to check if position is eye ball (inner center)
      const isEyeBall = (row: number, col: number): boolean => {
        const eyePositions = [
          { startRow: 0, startCol: 0 },
          { startRow: 0, startCol: size - 7 },
          { startRow: size - 7, startCol: 0 },
        ];

        for (const eye of eyePositions) {
          const relRow = row - eye.startRow;
          const relCol = col - eye.startCol;

          if (relRow >= 2 && relRow <= 4 && relCol >= 2 && relCol <= 4) {
            return true;
          }
        }
        return false;
      };

      // Draw body modules
      const drawModule = (
        x: number,
        y: number,
        moduleSize: number,
        pattern: BodyPattern
      ) => {
        const padding = moduleSize * 0.1;
        const innerSize = moduleSize - padding * 2;

        ctx.beginPath();

        switch (pattern) {
          case "dots":
            ctx.arc(
              x + moduleSize / 2,
              y + moduleSize / 2,
              innerSize / 2,
              0,
              Math.PI * 2
            );
            break;
          case "rounded":
            const radius = innerSize * 0.3;
            ctx.roundRect(
              x + padding,
              y + padding,
              innerSize,
              innerSize,
              radius
            );
            break;
          case "vertical":
            ctx.rect(
              x + moduleSize * 0.35,
              y + padding,
              moduleSize * 0.3,
              innerSize
            );
            break;
          case "horizontal":
            ctx.rect(
              x + padding,
              y + moduleSize * 0.35,
              innerSize,
              moduleSize * 0.3
            );
            break;
          case "diagonal":
            ctx.save();
            ctx.translate(x + moduleSize / 2, y + moduleSize / 2);
            ctx.rotate(Math.PI / 4);
            ctx.rect(
              -innerSize / 3,
              -innerSize / 3,
              (innerSize * 2) / 3,
              (innerSize * 2) / 3
            );
            ctx.restore();
            break;
          case "square":
          default:
            ctx.rect(x + padding, y + padding, innerSize, innerSize);
        }

        ctx.fill();
      };

      // Draw eye frame with style
      const drawEyeFrame = (
        eyeX: number,
        eyeY: number,
        frameSize: number,
        style: EyeFrameStyle
      ) => {
        const outerSize = frameSize * 7;
        const innerSize = frameSize * 5;
        const innerOffset = frameSize;

        ctx.beginPath();

        // Outer shape
        switch (style) {
          case "circle":
            ctx.arc(
              eyeX + outerSize / 2,
              eyeY + outerSize / 2,
              outerSize / 2,
              0,
              Math.PI * 2
            );
            break;
          case "rounded":
            ctx.roundRect(eyeX, eyeY, outerSize, outerSize, frameSize * 1.5);
            break;
          case "left-leaf":
            ctx.roundRect(eyeX, eyeY, outerSize, outerSize, [
              0,
              outerSize / 2,
              0,
              outerSize / 2,
            ]);
            break;
          case "right-leaf":
            ctx.roundRect(eyeX, eyeY, outerSize, outerSize, [
              outerSize / 2,
              0,
              outerSize / 2,
              0,
            ]);
            break;
          case "square":
          default:
            ctx.rect(eyeX, eyeY, outerSize, outerSize);
        }

        ctx.fill();

        // Cut out inner white area
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();

        switch (style) {
          case "circle":
            ctx.arc(
              eyeX + outerSize / 2,
              eyeY + outerSize / 2,
              innerSize / 2,
              0,
              Math.PI * 2
            );
            break;
          case "rounded":
            ctx.roundRect(
              eyeX + innerOffset,
              eyeY + innerOffset,
              innerSize,
              innerSize,
              frameSize
            );
            break;
          case "left-leaf":
            ctx.roundRect(
              eyeX + innerOffset,
              eyeY + innerOffset,
              innerSize,
              innerSize,
              [0, innerSize / 2.5, 0, innerSize / 2.5]
            );
            break;
          case "right-leaf":
            ctx.roundRect(
              eyeX + innerOffset,
              eyeY + innerOffset,
              innerSize,
              innerSize,
              [innerSize / 2.5, 0, innerSize / 2.5, 0]
            );
            break;
          case "square":
          default:
            ctx.rect(
              eyeX + innerOffset,
              eyeY + innerOffset,
              innerSize,
              innerSize
            );
        }

        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      };

      // Draw eye ball with style
      const drawEyeBall = (
        ballX: number,
        ballY: number,
        ballSize: number,
        style: EyeBallStyle
      ) => {
        const size3x3 = ballSize * 3;

        ctx.beginPath();

        switch (style) {
          case "circle":
            ctx.arc(
              ballX + size3x3 / 2,
              ballY + size3x3 / 2,
              size3x3 / 2,
              0,
              Math.PI * 2
            );
            break;
          case "rounded":
            ctx.roundRect(ballX, ballY, size3x3, size3x3, ballSize * 0.6);
            break;
          case "diamond":
            ctx.save();
            ctx.translate(ballX + size3x3 / 2, ballY + size3x3 / 2);
            ctx.rotate(Math.PI / 4);
            const diamondSize = size3x3 * 0.7;
            ctx.rect(
              -diamondSize / 2,
              -diamondSize / 2,
              diamondSize,
              diamondSize
            );
            ctx.restore();
            break;
          case "square":
          default:
            ctx.rect(ballX, ballY, size3x3, size3x3);
        }

        ctx.fill();
      };

      // First, draw the body modules (non-eye areas)
      ctx.fillStyle = getColor("body");

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules.get(row, col) && !isEyePosition(row, col)) {
            const x = (col + margin) * scale;
            const y = (row + margin) * scale;
            drawModule(x, y, scale, settings.bodyPattern);
          }
        }
      }

      // Draw eye frames
      ctx.fillStyle = getColor("eyeFrame");

      const eyePositions = [
        { row: 0, col: 0 },
        { row: 0, col: size - 7 },
        { row: size - 7, col: 0 },
      ];

      for (const eye of eyePositions) {
        const eyeX = (eye.col + margin) * scale;
        const eyeY = (eye.row + margin) * scale;
        drawEyeFrame(eyeX, eyeY, scale, settings.eyeFrameStyle);
      }

      // Draw eye balls
      ctx.fillStyle = getColor("eyeBall");

      for (const eye of eyePositions) {
        const ballX = (eye.col + margin + 2) * scale;
        const ballY = (eye.row + margin + 2) * scale;
        drawEyeBall(ballX, ballY, scale, settings.eyeBallStyle);
      }

      const dataUrl = canvas.toDataURL("image/png");
      setQrDataUrl(dataUrl);
      onGenerate?.(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [url, settings, onGenerate]);

  // Auto-regenerate when settings or URL change
  useEffect(() => {
    if (url.trim()) {
      const timer = setTimeout(() => {
        generateAdvancedQR();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [url, settings, generateAdvancedQR]);

  // Notify parent of settings changes
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Update setting helpers
  const updateBodyPattern = (pattern: BodyPattern) => {
    setSettings((prev) => ({ ...prev, bodyPattern: pattern }));
  };

  const updateEyeFrameStyle = (style: EyeFrameStyle) => {
    setSettings((prev) => ({ ...prev, eyeFrameStyle: style }));
  };

  const updateEyeBallStyle = (style: EyeBallStyle) => {
    setSettings((prev) => ({ ...prev, eyeBallStyle: style }));
  };

  const updateGradient = (updates: Partial<GradientSettings>) => {
    setSettings((prev) => ({
      ...prev,
      gradient: { ...prev.gradient, ...updates },
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qr-code-custom.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pattern preview grid component
  const PatternPreview = ({ pattern }: { pattern: BodyPattern }) => {
    const cells = [
      [1, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 1, 1],
      [0, 1, 1, 1, 0, 1],
      [1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 1],
    ];

    const getCellClass = () => {
      switch (pattern) {
        case "dots":
          return "rounded-full";
        case "rounded":
          return "rounded-[25%]";
        case "vertical":
          return "scale-x-[0.35] rounded-sm";
        case "horizontal":
          return "scale-y-[0.35] rounded-sm";
        case "diagonal":
          return "rotate-45 scale-[0.6]";
        default:
          return "";
      }
    };

    return (
      <div className="grid aspect-square grid-cols-6 gap-[3px] border border-border bg-surface p-2">
        {cells.flat().map((cell, i) => (
          <div key={i} className={`${cell ? `bg-fg ${getCellClass()}` : ""}`} />
        ))}
      </div>
    );
  };

  // Eye frame preview component
  const EyeFramePreview = ({ style }: { style: EyeFrameStyle }) => {
    const frameClass = {
      square: "rounded-none",
      rounded: "rounded-lg",
      circle: "rounded-full",
      "left-leaf": "rounded-[0_50%_0_50%]",
      "right-leaf": "rounded-[50%_0_50%_0]",
    }[style];

    return (
      <div className="relative h-12 w-12">
        <div
          className={`absolute h-full w-full border-[5px] border-fg ${frameClass}`}
        />
      </div>
    );
  };

  // Eye ball preview component
  const EyeBallPreview = ({ style }: { style: EyeBallStyle }) => {
    const ballClass = {
      square: "rounded-none",
      rounded: "rounded-[3px]",
      circle: "rounded-full",
      diamond: "rotate-45",
    }[style];

    return (
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className={`h-[18px] w-[18px] bg-fg ${ballClass}`} />
      </div>
    );
  };

  // Gradient type icon component
  const GradientTypeIcon = ({ type }: { type: GradientType }) => {
    const bgStyle = {
      solid: { background: settings.gradient.startColor },
      "linear-h": {
        background: `linear-gradient(90deg, ${settings.gradient.startColor}, ${settings.gradient.endColor})`,
      },
      "linear-v": {
        background: `linear-gradient(180deg, ${settings.gradient.startColor}, ${settings.gradient.endColor})`,
      },
      radial: {
        background: `radial-gradient(circle, ${settings.gradient.endColor}, ${settings.gradient.startColor})`,
      },
    }[type];

    return (
      <div
        className="h-12 w-12 rounded-md border border-border"
        style={bgStyle}
      />
    );
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-bg px-4 py-4 md:px-6">
        <div className="flex items-center">
          <h1 className="font-serif text-lg md:text-xl">
            Advanced Design Customization
          </h1>
          <span className="ml-3 bg-accent-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Beta
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 border border-border bg-white px-4 py-2 text-sm font-medium transition-all hover:border-accent hover:bg-accent-light md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-[18px] w-[18px]"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="7" y="7" width="10" height="10" />
          </svg>
          Preview
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <main className="overflow-y-auto p-4 md:p-8">
          {/* Body Pattern Section */}
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-light">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-[18px] w-[18px] text-accent"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl md:text-2xl">Body Pattern</h2>
              </div>
              <span className="text-xs text-muted">6 styles available</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
              {BODY_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => updateBodyPattern(pattern.id)}
                  className={`relative cursor-pointer border-2 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-fg hover:shadow-md md:p-4 ${
                    settings.bodyPattern === pattern.id
                      ? "border-accent bg-accent-light"
                      : "border-border"
                  }`}
                >
                  {settings.bodyPattern === pattern.id && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        className="h-3 w-3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <PatternPreview pattern={pattern.id} />
                  <div className="mt-3 text-center text-sm font-semibold">
                    {pattern.name}
                  </div>
                  <div className="mt-1 text-center text-xs text-muted">
                    {pattern.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Corner Styles Section */}
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-light">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-[18px] w-[18px] text-accent"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl md:text-2xl">
                  Corner Styles
                </h2>
              </div>
              <span className="text-xs text-muted">Eye frame & center</span>
            </div>

            {/* Corner Frame Style */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Corner Frame Style
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {EYE_FRAME_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateEyeFrameStyle(style.id)}
                    className={`flex flex-col items-center gap-2 border-2 bg-white p-4 transition-all hover:border-fg ${
                      settings.eyeFrameStyle === style.id
                        ? "border-accent bg-accent-light"
                        : "border-border"
                    }`}
                  >
                    <EyeFramePreview style={style.id} />
                    <span
                      className={`text-xs font-medium ${
                        settings.eyeFrameStyle === style.id
                          ? "font-semibold text-accent"
                          : "text-muted"
                      }`}
                    >
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Center Style */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Corner Center Style
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {EYE_BALL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateEyeBallStyle(style.id)}
                    className={`flex flex-col items-center gap-2 border-2 bg-white p-4 transition-all hover:border-fg ${
                      settings.eyeBallStyle === style.id
                        ? "border-accent bg-accent-light"
                        : "border-border"
                    }`}
                  >
                    <EyeBallPreview style={style.id} />
                    <span
                      className={`text-xs font-medium ${
                        settings.eyeBallStyle === style.id
                          ? "font-semibold text-accent"
                          : "text-muted"
                      }`}
                    >
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Gradient Colors Section */}
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-light">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-[18px] w-[18px] text-accent"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="2" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl md:text-2xl">
                  Gradient Colors
                </h2>
              </div>
              <span className="text-xs text-muted">Solid or gradient fill</span>
            </div>

            <div className="border border-border bg-white p-4 md:p-6">
              {/* Gradient Type Selector */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {GRADIENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateGradient({ type: type.id })}
                    className={`flex flex-col items-center gap-2.5 border-2 bg-white p-4 transition-all hover:border-fg ${
                      settings.gradient.type === type.id
                        ? "border-accent bg-accent-light"
                        : "border-border"
                    }`}
                  >
                    <GradientTypeIcon type={type.id} />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {type.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Color Pickers */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
                <div className="border border-border bg-surface p-4">
                  <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Start Color
                  </label>
                  <div className="flex items-center gap-3 border border-border bg-white p-2">
                    <input
                      type="color"
                      value={settings.gradient.startColor}
                      onChange={(e) =>
                        updateGradient({ startColor: e.target.value })
                      }
                      className="h-10 w-10 cursor-pointer rounded border-none"
                    />
                    <input
                      type="text"
                      value={settings.gradient.startColor.toUpperCase()}
                      onChange={(e) =>
                        updateGradient({ startColor: e.target.value })
                      }
                      className="flex-1 border-none bg-transparent font-mono text-sm uppercase outline-none"
                      maxLength={7}
                    />
                  </div>
                </div>

                <div className="border border-border bg-surface p-4">
                  <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    End Color
                  </label>
                  <div className="flex items-center gap-3 border border-border bg-white p-2">
                    <input
                      type="color"
                      value={settings.gradient.endColor}
                      onChange={(e) =>
                        updateGradient({ endColor: e.target.value })
                      }
                      className="h-10 w-10 cursor-pointer rounded border-none"
                    />
                    <input
                      type="text"
                      value={settings.gradient.endColor.toUpperCase()}
                      onChange={(e) =>
                        updateGradient({ endColor: e.target.value })
                      }
                      className="flex-1 border-none bg-transparent font-mono text-sm uppercase outline-none"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Direction Options (only show for linear gradients) */}
              {settings.gradient.type !== "solid" &&
                settings.gradient.type !== "radial" && (
                  <div className="mb-6 flex items-center gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Direction
                    </span>
                    <div className="flex gap-2">
                      {(
                        [
                          { dir: "0deg", icon: "M5 12h14M12 5l7 7-7 7" },
                          { dir: "90deg", icon: "M12 5v14M5 12l7 7 7-7" },
                          { dir: "135deg", icon: "M7 17L17 7M17 7H10M17 7v7" },
                        ] as const
                      ).map(({ dir, icon }) => (
                        <button
                          key={dir}
                          onClick={() => updateGradient({ direction: dir })}
                          className={`flex h-11 w-11 items-center justify-center border-2 bg-white transition-all hover:border-fg ${
                            settings.gradient.direction === dir
                              ? "border-accent bg-accent-light"
                              : "border-border"
                          }`}
                          title={dir}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`h-5 w-5 ${
                              settings.gradient.direction === dir
                                ? "text-accent"
                                : "text-muted"
                            }`}
                          >
                            <path d={icon} />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Gradient Preview */}
              <div
                className="mb-5 h-14 rounded-lg border border-border"
                style={{
                  background:
                    settings.gradient.type === "solid"
                      ? settings.gradient.startColor
                      : settings.gradient.type === "radial"
                        ? `radial-gradient(circle, ${settings.gradient.endColor}, ${settings.gradient.startColor})`
                        : `linear-gradient(${
                            settings.gradient.type === "linear-h"
                              ? "90deg"
                              : settings.gradient.type === "linear-v"
                                ? "180deg"
                                : settings.gradient.direction
                          }, ${settings.gradient.startColor}, ${settings.gradient.endColor})`,
                }}
              />

              {/* Apply Targets */}
              <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                {[
                  { key: "applyToBody", label: "Apply to Body" },
                  { key: "applyToEyeFrames", label: "Apply to Eye Frames" },
                  { key: "applyToEyeBalls", label: "Apply to Eye Balls" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() =>
                      updateGradient({
                        [key]:
                          !settings.gradient[key as keyof GradientSettings],
                      } as Partial<GradientSettings>)
                    }
                    className={`flex items-center gap-2 border px-4 py-2.5 text-sm transition-all ${
                      settings.gradient[key as keyof GradientSettings]
                        ? "border-accent bg-accent-light text-accent"
                        : "border-border bg-white hover:border-fg"
                    }`}
                  >
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-sm border-2 transition-all ${
                        settings.gradient[key as keyof GradientSettings]
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {settings.gradient[key as keyof GradientSettings] && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          className="h-3 w-3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Sidebar - Live Preview */}
        <aside
          className={`fixed bottom-0 left-0 right-0 flex max-h-[60vh] flex-col border-l border-border bg-white transition-transform duration-300 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:max-h-none ${
            isSidebarOpen
              ? "translate-y-0"
              : "translate-y-[calc(100%-60px)] lg:translate-y-0"
          }`}
        >
          {/* Mobile Handle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center border-b border-border bg-surface py-3 lg:hidden"
          >
            <div className="h-1 w-10 rounded bg-border" />
          </button>

          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Live Preview
            </h3>
            <span className="flex items-center gap-1.5 rounded-sm bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-600">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-green-500 ${isGenerating ? "animate-pulse" : ""}`}
              />
              Auto-updating
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center bg-surface p-8">
            <div className="h-[200px] w-[200px] border border-border bg-white p-4">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR code preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <span className="text-sm text-muted">Enter a URL</span>
                </div>
              )}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-surface px-5 py-4 text-xs text-muted">
            <div className="flex justify-between py-1.5">
              <span>Pattern</span>
              <strong className="text-fg">
                {BODY_PATTERNS.find((p) => p.id === settings.bodyPattern)?.name}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Corner Frame</span>
              <strong className="text-fg">
                {
                  EYE_FRAME_STYLES.find((s) => s.id === settings.eyeFrameStyle)
                    ?.name
                }
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Corner Center</span>
              <strong className="text-fg">
                {
                  EYE_BALL_STYLES.find((s) => s.id === settings.eyeBallStyle)
                    ?.name
                }
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Gradient</span>
              <strong className="text-fg">
                {
                  GRADIENT_TYPES.find((t) => t.id === settings.gradient.type)
                    ?.name
                }
              </strong>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
            <button
              onClick={downloadQR}
              disabled={!qrDataUrl || isGenerating}
              className="flex items-center justify-center gap-2 bg-fg px-5 py-3.5 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
              Generate & Download
            </button>
            <button
              onClick={resetToDefaults}
              className="flex items-center justify-center gap-2 border border-border bg-white px-5 py-3 font-medium text-fg transition-colors hover:border-fg"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              Reset to Defaults
            </button>
          </div>
        </aside>
      </div>

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
