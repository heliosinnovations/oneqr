"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

// Types
type WizardStep = 1 | 2 | 3 | 4 | 5;
type QRType = "url" | "text" | "email" | "phone" | "vcard" | "wifi" | "auto";
type BodyPattern =
  | "square"
  | "dots"
  | "rounded"
  | "vertical"
  | "horizontal"
  | "diamond";
type EyeFrameStyle =
  | "square"
  | "rounded"
  | "circle"
  | "left-leaf"
  | "right-leaf";
type EyeBallStyle = "square" | "rounded" | "circle" | "diamond";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type DownloadFormat = "png" | "svg" | "pdf" | "eps";
type Resolution = 72 | 150 | 300 | 600;
type GridLayout = "2x2" | "3x3" | "4x4";
type PageSize = "a4" | "letter" | "custom";

interface ParsedRow {
  rowNumber: number;
  type: QRType;
  content: string;
  label: string;
  isValid: boolean;
  errorMessage?: string;
  isDuplicate?: boolean;
}

interface ColumnMapping {
  type: string | null;
  content: string | null;
  label: string | null;
}

interface TemplateSettings {
  bodyPattern: BodyPattern;
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrectionLevel;
  logoDataUrl: string | null;
}

interface GenerationProgress {
  current: number;
  total: number;
  errors: Array<{ rowNumber: number; message: string }>;
  generatedCodes: Array<{ rowNumber: number; label: string; dataUrl: string }>;
}

interface DownloadSettings {
  mode: "zip" | "pdf";
  format: DownloadFormat;
  resolution: Resolution;
  filenamePattern: string;
  gridLayout: GridLayout;
  pageSize: PageSize;
  includeLabels: boolean;
}

// Constants
const BODY_PATTERNS: { id: BodyPattern; name: string }[] = [
  { id: "square", name: "Square" },
  { id: "dots", name: "Dots" },
  { id: "rounded", name: "Rounded" },
  { id: "vertical", name: "Vertical" },
  { id: "horizontal", name: "Horizontal" },
  { id: "diamond", name: "Diamond" },
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

const ERROR_LEVELS: {
  value: ErrorCorrectionLevel;
  label: string;
  percentage: string;
}[] = [
  { value: "L", label: "L", percentage: "7%" },
  { value: "M", label: "M", percentage: "15%" },
  { value: "Q", label: "Q", percentage: "25%" },
  { value: "H", label: "H", percentage: "30%" },
];

const DEFAULT_TEMPLATE: TemplateSettings = {
  bodyPattern: "dots",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  fgColor: "#1a1a1a",
  bgColor: "#ffffff",
  errorCorrection: "M",
  logoDataUrl: null,
};

const DEFAULT_DOWNLOAD: DownloadSettings = {
  mode: "zip",
  format: "png",
  resolution: 300,
  filenamePattern: "{label}-{row_number}",
  gridLayout: "3x3",
  pageSize: "letter",
  includeLabels: true,
};

export default function BulkQRCreator() {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set()
  );

  // Step 1: Upload state
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    type: null,
    content: null,
    label: null,
  });
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Paste data state
  type InputTab = "upload" | "paste";
  const [activeInputTab, setActiveInputTab] = useState<InputTab>("upload");
  const [pasteData, setPasteData] = useState<string>("");

  // Step 2: Template state
  const [template, setTemplate] = useState<TemplateSettings>(DEFAULT_TEMPLATE);

  // Step 3: Validation state
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());

  // Step 4: Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    errors: [],
    generatedCodes: [],
  });
  const [generationLogs, setGenerationLogs] = useState<
    Array<{ time: string; message: string; type: "success" | "error" }>
  >([]);

  // Step 5: Download state
  const [downloadSettings, setDownloadSettings] =
    useState<DownloadSettings>(DEFAULT_DOWNLOAD);
  const [isDownloading, setIsDownloading] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // SessionStorage persistence
  useEffect(() => {
    const saved = sessionStorage.getItem("bulkQRCreatorState");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.currentStep) setCurrentStep(state.currentStep);
        if (state.template) setTemplate(state.template);
        if (state.downloadSettings) setDownloadSettings(state.downloadSettings);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "bulkQRCreatorState",
      JSON.stringify({
        currentStep,
        template,
        downloadSettings,
      })
    );
  }, [currentStep, template, downloadSettings]);

  // Auto-scroll generation logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [generationLogs]);

  // File upload handlers
  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const processFile = useCallback((file: File) => {
    setUploadError(null);

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const isValidType =
      validTypes.includes(file.type) ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isValidType) {
      setUploadError(
        "Invalid file type. Please upload a CSV, XLSX, or XLS file."
      );
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10MB.");
      return;
    }

    setFile(file);

    // Parse file
    if (file.name.endsWith(".csv")) {
      parseCSV(file);
    } else {
      parseExcel(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) {
          setUploadError(
            "File must contain at least a header row and one data row."
          );
          return;
        }

        if (data.length > 10001) {
          setUploadError("File exceeds maximum of 10,000 rows.");
          return;
        }

        const headers = data[0];
        setHeaders(headers);
        setRawData(data.slice(1));
        autoDetectMapping(headers);
      },
      error: (error) => {
        setUploadError(`Failed to parse CSV: ${error.message}`);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseExcel = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
        }) as string[][];

        if (jsonData.length < 2) {
          setUploadError(
            "File must contain at least a header row and one data row."
          );
          return;
        }

        if (jsonData.length > 10001) {
          setUploadError("File exceeds maximum of 10,000 rows.");
          return;
        }

        const headers = jsonData[0].map((h) => String(h));
        setHeaders(headers);
        setRawData(
          jsonData.slice(1).map((row) => row.map((cell) => String(cell ?? "")))
        );
        autoDetectMapping(headers);
      } catch {
        setUploadError(
          "Failed to parse Excel file. Please check the file format."
        );
      }
    };
    reader.readAsArrayBuffer(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse pasted CSV/TSV text with auto-delimiter detection
  const parseCSVText = useCallback((text: string) => {
    setUploadError(null);

    if (!text.trim()) {
      setRawData([]);
      setHeaders([]);
      setColumnMapping({ type: null, content: null, label: null });
      setParsedRows([]);
      return;
    }

    // Auto-detect delimiter (tab, comma, or semicolon)
    const firstLine = text.split("\n")[0];
    let delimiter = ",";
    if (firstLine.includes("\t")) {
      delimiter = "\t";
    } else if (firstLine.includes(";") && !firstLine.includes(",")) {
      delimiter = ";";
    }

    try {
      const results = Papa.parse<string[]>(text, {
        delimiter: delimiter,
      });

      if (results.errors && results.errors.length > 0) {
        setUploadError(`Failed to parse data: ${results.errors[0].message}`);
        return;
      }

      const data = results.data;
      // Filter out empty rows
      const filteredData = data.filter((row) =>
        row.some((cell) => cell && cell.trim())
      );

      if (filteredData.length < 2) {
        setUploadError(
          "Data must contain at least a header row and one data row."
        );
        return;
      }

      if (filteredData.length > 10001) {
        setUploadError("Data exceeds maximum of 10,000 rows.");
        return;
      }

      const detectedHeaders = filteredData[0];
      setHeaders(detectedHeaders);
      setRawData(filteredData.slice(1));
      autoDetectMapping(detectedHeaders);
    } catch (error) {
      setUploadError(
        `Failed to parse data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle paste data change with auto-parse
  const handlePasteDataChange = useCallback(
    (text: string) => {
      setPasteData(text);
      // Debounce parsing - only parse after user stops typing
      const timeoutId = setTimeout(() => {
        parseCSVText(text);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [parseCSVText]
  );

  // Clear all input data
  const clearInputData = useCallback(() => {
    setFile(null);
    setPasteData("");
    setRawData([]);
    setHeaders([]);
    setColumnMapping({ type: null, content: null, label: null });
    setParsedRows([]);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Switch input tabs and clear other input
  const switchInputTab = useCallback(
    (tab: InputTab) => {
      if (tab !== activeInputTab) {
        clearInputData();
        setActiveInputTab(tab);
      }
    },
    [activeInputTab, clearInputData]
  );

  const autoDetectMapping = useCallback((headers: string[]) => {
    const mapping: ColumnMapping = { type: null, content: null, label: null };
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

    // Auto-detect type column
    const typeKeywords = ["type", "qr_type", "qrtype", "kind"];
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (typeKeywords.some((k) => lowerHeaders[i].includes(k))) {
        mapping.type = headers[i];
        break;
      }
    }

    // Auto-detect content column
    const contentKeywords = [
      "content",
      "data",
      "url",
      "link",
      "text",
      "value",
      "email",
      "phone",
    ];
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (
        contentKeywords.some((k) => lowerHeaders[i].includes(k)) &&
        headers[i] !== mapping.type
      ) {
        mapping.content = headers[i];
        break;
      }
    }

    // Auto-detect label column
    const labelKeywords = ["label", "name", "title", "id", "identifier"];
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (
        labelKeywords.some((k) => lowerHeaders[i].includes(k)) &&
        headers[i] !== mapping.type &&
        headers[i] !== mapping.content
      ) {
        mapping.label = headers[i];
        break;
      }
    }

    setColumnMapping(mapping);
  }, []);

  // Process mapped data into parsed rows
  useEffect(() => {
    if (rawData.length === 0 || !columnMapping.content) return;

    const typeIndex = columnMapping.type
      ? headers.indexOf(columnMapping.type)
      : -1;
    const contentIndex = headers.indexOf(columnMapping.content!);
    const labelIndex = columnMapping.label
      ? headers.indexOf(columnMapping.label)
      : -1;

    const contentSet = new Set<string>();
    const rows: ParsedRow[] = rawData.map((row, index) => {
      const content = row[contentIndex] || "";
      const type =
        typeIndex >= 0 ? detectQRType(row[typeIndex] || "", content) : "auto";
      const label =
        labelIndex >= 0
          ? row[labelIndex] || `Row-${index + 1}`
          : `Row-${index + 1}`;

      // Validation
      let isValid = true;
      let errorMessage: string | undefined;
      let isDuplicate = false;

      if (!content.trim()) {
        isValid = false;
        errorMessage = "Missing content field";
      } else if (type === "url" || (type === "auto" && isUrl(content))) {
        if (!isValidUrl(content)) {
          isValid = false;
          errorMessage = `Invalid URL format: "${content.substring(0, 30)}${content.length > 30 ? "..." : ""}"`;
        }
      } else if (content.length > 2953) {
        isValid = false;
        errorMessage = "Content exceeds maximum length";
      }

      // Check for duplicates
      if (contentSet.has(content)) {
        isDuplicate = true;
      } else {
        contentSet.add(content);
      }

      return {
        rowNumber: index + 1,
        type: type === "auto" ? detectTypeFromContent(content) : type,
        content,
        label,
        isValid,
        errorMessage,
        isDuplicate,
      };
    });

    setParsedRows(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData, headers, columnMapping]);

  const detectQRType = (typeStr: string, content: string): QRType => {
    const lower = typeStr.toLowerCase().trim();
    if (["url", "link", "website"].includes(lower)) return "url";
    if (["text", "plain"].includes(lower)) return "text";
    if (["email", "mail"].includes(lower)) return "email";
    if (["phone", "tel", "telephone"].includes(lower)) return "phone";
    if (["vcard", "contact"].includes(lower)) return "vcard";
    if (["wifi", "network"].includes(lower)) return "wifi";
    return "auto";
  };

  const detectTypeFromContent = (content: string): QRType => {
    if (isUrl(content)) return "url";
    if (content.includes("@") && !content.includes(" ")) return "email";
    if (/^[\d\s\-+()]+$/.test(content) && content.length >= 7) return "phone";
    if (content.startsWith("BEGIN:VCARD")) return "vcard";
    if (content.startsWith("WIFI:")) return "wifi";
    return "text";
  };

  const isUrl = (str: string): boolean => {
    return (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("www.")
    );
  };

  const isValidUrl = (str: string): boolean => {
    try {
      let urlToCheck = str;
      if (str.startsWith("www.")) {
        urlToCheck = "https://" + str;
      }
      new URL(urlToCheck);
      return true;
    } catch {
      return false;
    }
  };

  const removeFile = useCallback(() => {
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setColumnMapping({ type: null, content: null, label: null });
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Template handlers
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplate((prev) => ({
          ...prev,
          logoDataUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const removeLogo = useCallback(() => {
    setTemplate((prev) => ({ ...prev, logoDataUrl: null }));
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }, []);

  // Validation helpers
  const validRows = parsedRows.filter(
    (r) => r.isValid && !excludedRows.has(r.rowNumber)
  );
  const errorRows = parsedRows.filter((r) => !r.isValid);
  const duplicateRows = parsedRows.filter((r) => r.isDuplicate);

  const toggleExcludeRow = useCallback((rowNumber: number) => {
    setExcludedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  }, []);

  // QR Generation
  const generateCustomQR = useCallback(
    async (content: string): Promise<string> => {
      const qrData = await QRCode.create(content, {
        errorCorrectionLevel: template.errorCorrection,
      });

      const modules = qrData.modules;
      const size = modules.size;
      const canvas = document.createElement("canvas");
      const scale = 10;
      const margin = 4;
      const canvasSize = (size + margin * 2) * scale;

      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = template.bgColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Helper functions
      const isEyePosition = (row: number, col: number): boolean => {
        if (row < 7 && col < 7) return true;
        if (row < 7 && col >= size - 7) return true;
        if (row >= size - 7 && col < 7) return true;
        return false;
      };

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
            ctx.roundRect(
              x + padding,
              y + padding,
              innerSize,
              innerSize,
              innerSize * 0.3
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
          case "diamond":
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

        // Cut out inner
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

      // Draw body modules
      ctx.fillStyle = template.fgColor;

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules.get(row, col) && !isEyePosition(row, col)) {
            const x = (col + margin) * scale;
            const y = (row + margin) * scale;
            drawModule(x, y, scale, template.bodyPattern);
          }
        }
      }

      // Draw eye frames
      const eyePositions = [
        { row: 0, col: 0 },
        { row: 0, col: size - 7 },
        { row: size - 7, col: 0 },
      ];

      for (const eye of eyePositions) {
        const eyeX = (eye.col + margin) * scale;
        const eyeY = (eye.row + margin) * scale;
        drawEyeFrame(eyeX, eyeY, scale, template.eyeFrameStyle);
      }

      // Draw eye balls
      for (const eye of eyePositions) {
        const ballX = (eye.col + margin + 2) * scale;
        const ballY = (eye.row + margin + 2) * scale;
        drawEyeBall(ballX, ballY, scale, template.eyeBallStyle);
      }

      // Add logo if present
      if (template.logoDataUrl) {
        await new Promise<void>((resolve) => {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = Math.round(canvasSize * 0.22);
            const logoX = (canvasSize - logoSize) / 2;
            const logoY = (canvasSize - logoSize) / 2;

            // White background for logo
            ctx.fillStyle = template.bgColor;
            ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            resolve();
          };
          logoImg.src = template.logoDataUrl!;
        });
      }

      return canvas.toDataURL("image/png");
    },
    [template]
  );

  const startGeneration = useCallback(async () => {
    setIsGenerating(true);
    setProgress({
      current: 0,
      total: validRows.length,
      errors: [],
      generatedCodes: [],
    });
    setGenerationLogs([]);

    const results: GenerationProgress = {
      current: 0,
      total: validRows.length,
      errors: [],
      generatedCodes: [],
    };

    const addLog = (message: string, type: "success" | "error") => {
      const time = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setGenerationLogs((prev) => [...prev, { time, message, type }]);
    };

    // Process in chunks to keep UI responsive
    const chunkSize = 50;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);

      for (const row of chunk) {
        try {
          const dataUrl = await generateCustomQR(row.content);
          results.generatedCodes.push({
            rowNumber: row.rowNumber,
            label: row.label,
            dataUrl,
          });
          results.current++;
          addLog(`Generated: ${row.label}.png`, "success");
        } catch (error) {
          results.errors.push({
            rowNumber: row.rowNumber,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          results.current++;
          addLog(`Skipped: Row ${row.rowNumber} (generation failed)`, "error");
        }

        setProgress({ ...results });
      }

      // Yield to UI
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setIsGenerating(false);

    // Auto-advance to download step
    setCompletedSteps((prev) => new Set([...prev, 4]));
    setCurrentStep(5);
  }, [validRows, generateCustomQR]);

  // Download handlers
  const downloadZip = useCallback(async () => {
    setIsDownloading(true);

    const zip = new JSZip();
    const { resolution, filenamePattern, format } = downloadSettings;

    for (const code of progress.generatedCodes) {
      let filename = filenamePattern
        .replace("{label}", code.label.replace(/[^a-zA-Z0-9-_]/g, "_"))
        .replace("{row_number}", String(code.rowNumber));
      filename += `.${format}`;

      if (format === "png") {
        // Scale to desired resolution
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = resolution / 72;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d")!;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  zip.file(filename, blob);
                }
                resolve();
              },
              "image/png",
              1.0
            );
          };
          img.src = code.dataUrl;
        });
      } else if (format === "svg") {
        // For SVG, we need to generate fresh
        const svgData = await QRCode.toString(
          progress.generatedCodes.find((c) => c.rowNumber === code.rowNumber)
            ?.label || "",
          { type: "svg" }
        );
        zip.file(filename, svgData);
      } else {
        // For PDF and EPS, use PNG for now
        const response = await fetch(code.dataUrl);
        const blob = await response.blob();
        zip.file(filename.replace(`.${format}`, ".png"), blob);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "qr-codes.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
  }, [progress.generatedCodes, downloadSettings]);

  const downloadPDF = useCallback(async () => {
    setIsDownloading(true);

    const { gridLayout, pageSize, includeLabels } = downloadSettings;

    // Page dimensions in mm
    const pageDimensions = {
      a4: { width: 210, height: 297 },
      letter: { width: 215.9, height: 279.4 },
      custom: { width: 210, height: 297 },
    };

    const { width: pageWidth, height: pageHeight } = pageDimensions[pageSize];
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    const gridConfig = {
      "2x2": { cols: 2, rows: 2 },
      "3x3": { cols: 3, rows: 3 },
      "4x4": { cols: 4, rows: 4 },
    };

    const { cols, rows } = gridConfig[gridLayout];
    const margin = 15;
    const spacing = 10;
    const qrSize = (pageWidth - margin * 2 - spacing * (cols - 1)) / cols;
    const labelHeight = includeLabels ? 6 : 0;
    const cellHeight = qrSize + labelHeight + spacing;

    const codesPerPage = cols * rows;
    let currentPage = 0;
    let positionOnPage = 0;

    for (let i = 0; i < progress.generatedCodes.length; i++) {
      const code = progress.generatedCodes[i];

      if (positionOnPage === 0 && i > 0) {
        pdf.addPage();
        currentPage++;
      }

      const col = positionOnPage % cols;
      const row = Math.floor(positionOnPage / cols);

      const x = margin + col * (qrSize + spacing);
      const y = margin + row * cellHeight;

      // Add QR code image
      pdf.addImage(code.dataUrl, "PNG", x, y, qrSize, qrSize);

      // Add label if enabled
      if (includeLabels) {
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        const labelY = y + qrSize + 4;
        pdf.text(code.label, x + qrSize / 2, labelY, { align: "center" });
      }

      positionOnPage++;
      if (positionOnPage >= codesPerPage) {
        positionOnPage = 0;
      }
    }

    pdf.save("qr-codes.pdf");
    setIsDownloading(false);
  }, [progress.generatedCodes, downloadSettings]);

  // Navigation
  const goToStep = (step: WizardStep) => {
    // Can only go to completed steps or the next step
    if (step <= currentStep || completedSteps.has((step - 1) as WizardStep)) {
      setCurrentStep(step);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return parsedRows.length > 0 && !!columnMapping.content;
      case 2:
        return true; // Template is always valid
      case 3:
        return validRows.length > 0;
      case 4:
        return progress.generatedCodes.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    if (currentStep === 3) {
      // Start generation when going from step 3 to 4
      setCurrentStep(4);
      setTimeout(() => startGeneration(), 100);
    } else if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      // Navigate back to home when on step 1
      router.push("/");
    } else {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setFile(null);
    setPasteData("");
    setActiveInputTab("upload");
    setRawData([]);
    setHeaders([]);
    setColumnMapping({ type: null, content: null, label: null });
    setParsedRows([]);
    setExcludedRows(new Set());
    setProgress({ current: 0, total: 0, errors: [], generatedCodes: [] });
    setGenerationLogs([]);
    sessionStorage.removeItem("bulkQRCreatorState");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderUploadStep();
      case 2:
        return renderTemplateStep();
      case 3:
        return renderValidationStep();
      case 4:
        return renderGenerationStep();
      case 5:
        return renderDownloadStep();
      default:
        return null;
    }
  };

  const renderUploadStep = () => {
    const hasData = file || (pasteData.trim() && rawData.length > 0);
    const showDataPreview = hasData && !uploadError;

    return (
      <section className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-fg md:text-4xl">
            Upload Your Data
          </h1>
          <p className="mt-2 text-muted">
            Upload a CSV or Excel file, or paste your data directly
          </p>
        </div>

        {/* Input Method Tabs */}
        <div className="mb-6 flex border-b border-border">
          <button
            onClick={() => switchInputTab("upload")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeInputTab === "upload"
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-fg"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload File
          </button>
          <button
            onClick={() => switchInputTab("paste")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeInputTab === "paste"
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-fg"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Paste Data
          </button>
        </div>

        {/* Upload File Tab */}
        {activeInputTab === "upload" && (
          <>
            {/* Upload Zone */}
            {!file && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`cursor-pointer border-2 border-dashed bg-surface p-12 text-center transition-all ${
                  isDragOver
                    ? "border-accent bg-accent-light"
                    : "border-border hover:border-accent hover:bg-accent-light"
                }`}
              >
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
                  <polyline points="9 15 12 12 15 15" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                </svg>
                <h3 className="mb-2 font-serif text-xl">Drop your file here</h3>
                <p className="mb-4 text-sm text-muted">
                  or click to browse your computer
                </p>
                <div className="flex justify-center gap-2">
                  <span className="border border-border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    CSV
                  </span>
                  <span className="border border-border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    XLSX
                  </span>
                  <span className="border border-border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    XLS
                  </span>
                </div>
              </div>
            )}

            {/* File Info */}
            {file && !uploadError && (
              <div className="flex items-center justify-between border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-green-100 text-green-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-xs text-muted">
                      {rawData.length.toLocaleString()} rows &bull;{" "}
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearInputData}
                  className="p-2 text-muted transition-colors hover:text-red-500"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Paste Data Tab */}
        {activeInputTab === "paste" && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={pasteData}
                onChange={(e) => handlePasteDataChange(e.target.value)}
                placeholder={`Paste your CSV data here...\n\nExample:\ntype,content,label\nurl,https://example.com/1,Link 1\nurl,https://example.com/2,Link 2`}
                className="min-h-[240px] w-full resize-y border border-border bg-white p-4 font-mono text-sm focus:border-accent focus:outline-none"
                rows={10}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted">
                {pasteData.length.toLocaleString()} characters
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Tip: Copy from Excel or Google Sheets and paste directly. Supports
              comma, tab, and semicolon delimiters.
            </p>

            {/* Paste Data Info */}
            {pasteData.trim() && rawData.length > 0 && !uploadError && (
              <div className="flex items-center justify-between border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-green-100 text-green-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">
                      Data parsed successfully
                    </div>
                    <div className="text-xs text-muted">
                      {rawData.length.toLocaleString()} rows detected
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearInputData}
                  className="p-2 text-muted transition-colors hover:text-red-500"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {uploadError && (
          <div className="mt-4 border border-red-500 bg-red-50 p-4 text-sm text-red-600">
            {uploadError}
          </div>
        )}

        {/* Column Mapping & Data Preview (shared for both tabs) */}
        {showDataPreview && headers.length > 0 && (
          <div className="mt-6 border border-border bg-white">
            {/* Column Mapping */}
            <div className="p-6">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Column Mapping
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                {headers.map((header) => (
                  <div
                    key={header}
                    className="flex items-center gap-3 border border-border bg-surface p-3"
                  >
                    <div className="flex-1 truncate font-mono text-sm">
                      {header}
                    </div>
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-muted"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <select
                      value={
                        columnMapping.type === header
                          ? "type"
                          : columnMapping.content === header
                            ? "content"
                            : columnMapping.label === header
                              ? "label"
                              : "skip"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setColumnMapping((prev) => {
                          const next = { ...prev };
                          // Clear previous mapping for this role
                          if (next.type === header) next.type = null;
                          if (next.content === header) next.content = null;
                          if (next.label === header) next.label = null;
                          // Set new mapping
                          if (value === "type") next.type = header;
                          if (value === "content") next.content = header;
                          if (value === "label") next.label = header;
                          return next;
                        });
                      }}
                      className="border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="skip">Skip</option>
                      <option value="type">QR Type</option>
                      <option value="content">Content</option>
                      <option value="label">Label</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Preview */}
            {parsedRows.length > 0 && (
              <div className="border-t border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Data Preview
                  </h4>
                  <span className="bg-accent-light px-2 py-1 text-[10px] font-bold text-accent">
                    First 5 rows
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface">
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                          Content
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                          Label
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row) => (
                        <tr
                          key={row.rowNumber}
                          className="border-b border-border"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-muted">
                            {row.rowNumber}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.type}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-sm">
                            {row.content}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  const renderTemplateStep = () => (
    <section className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-fg md:text-4xl">
          Design Your Template
        </h1>
        <p className="mt-2 text-muted">
          Customize the appearance of all {validRows.length.toLocaleString()} QR
          codes
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Design Options */}
        <div className="space-y-4">
          {/* Body Pattern */}
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  className="h-4 w-4 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Body Pattern
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
              {BODY_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() =>
                    setTemplate((prev) => ({
                      ...prev,
                      bodyPattern: pattern.id,
                    }))
                  }
                  className={`flex flex-col items-center gap-2 border-2 p-3 transition-all ${
                    template.bodyPattern === pattern.id
                      ? "border-accent bg-accent-light"
                      : "border-border bg-white hover:border-fg"
                  }`}
                >
                  <PatternPreview pattern={pattern.id} />
                  <span className="text-[10px] font-semibold uppercase">
                    {pattern.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  className="h-4 w-4 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="13.5" cy="6.5" r="4" />
                  <circle cx="17.5" cy="13.5" r="4" />
                  <circle cx="8.5" cy="13.5" r="4" />
                </svg>
                Colors
              </h3>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Foreground
                </label>
                <div className="flex items-center gap-2 border border-border bg-white p-2">
                  <input
                    type="color"
                    value={template.fgColor}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        fgColor: e.target.value,
                      }))
                    }
                    className="h-8 w-8 cursor-pointer border-none"
                  />
                  <input
                    type="text"
                    value={template.fgColor.toUpperCase()}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        fgColor: e.target.value,
                      }))
                    }
                    className="flex-1 border-none font-mono text-sm uppercase outline-none"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Background
                </label>
                <div className="flex items-center gap-2 border border-border bg-white p-2">
                  <input
                    type="color"
                    value={template.bgColor}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        bgColor: e.target.value,
                      }))
                    }
                    className="h-8 w-8 cursor-pointer border-none"
                  />
                  <input
                    type="text"
                    value={template.bgColor.toUpperCase()}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        bgColor: e.target.value,
                      }))
                    }
                    className="flex-1 border-none font-mono text-sm uppercase outline-none"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Eye Styles */}
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  className="h-4 w-4 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Corner Styles
              </h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Frame Style
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {EYE_FRAME_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        setTemplate((prev) => ({
                          ...prev,
                          eyeFrameStyle: style.id,
                        }))
                      }
                      className={`flex flex-col items-center gap-1 border-2 p-2 transition-all ${
                        template.eyeFrameStyle === style.id
                          ? "border-accent bg-accent-light"
                          : "border-border bg-white hover:border-fg"
                      }`}
                    >
                      <EyeFramePreview style={style.id} />
                      <span className="text-[9px] font-medium text-muted">
                        {style.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Center Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EYE_BALL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        setTemplate((prev) => ({
                          ...prev,
                          eyeBallStyle: style.id,
                        }))
                      }
                      className={`flex flex-col items-center gap-1 border-2 p-2 transition-all ${
                        template.eyeBallStyle === style.id
                          ? "border-accent bg-accent-light"
                          : "border-border bg-white hover:border-fg"
                      }`}
                    >
                      <EyeBallPreview style={style.id} />
                      <span className="text-[9px] font-medium text-muted">
                        {style.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  className="h-4 w-4 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Center Logo
              </h3>
            </div>
            <div className="p-4">
              {!template.logoDataUrl ? (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-border p-6 text-center transition-all hover:border-accent hover:bg-accent-light"
                >
                  <svg
                    className="mx-auto mb-2 h-8 w-8 text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-sm text-muted">Upload logo (PNG, SVG)</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.logoDataUrl}
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="border border-border bg-white px-3 py-1.5 text-xs font-medium hover:border-fg"
                    >
                      Change
                    </button>
                    <button
                      onClick={removeLogo}
                      className="border border-border bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Correction */}
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <svg
                  className="h-4 w-4 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Error Correction
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-2 p-4">
              {ERROR_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    setTemplate((prev) => ({
                      ...prev,
                      errorCorrection: level.value,
                    }))
                  }
                  className={`flex flex-col items-center border-2 p-3 transition-all ${
                    template.errorCorrection === level.value
                      ? "border-accent bg-accent-light"
                      : "border-border bg-white hover:border-fg"
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${
                      template.errorCorrection === level.value
                        ? "text-accent"
                        : "text-fg"
                    }`}
                  >
                    {level.label}
                  </span>
                  <span className="text-[10px] text-muted">
                    {level.percentage}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:sticky lg:top-24">
          <div className="border border-border bg-white">
            <div className="border-b border-border bg-surface p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Live Preview
              </h3>
            </div>
            <div className="flex justify-center bg-surface p-8">
              <div className="h-[180px] w-[180px] border border-border bg-white p-4">
                <LivePreview
                  template={template}
                  content={parsedRows[0]?.content || "https://example.com"}
                />
              </div>
            </div>
            <div className="border-t border-border p-4 text-center text-xs text-muted">
              Sample data: {parsedRows[0]?.label || "Row 1"}
            </div>
          </div>

          <div className="mt-4 border border-border bg-surface p-4 text-xs text-muted">
            <strong className="text-fg">Applying to:</strong>
            <br />
            {validRows.length.toLocaleString()} QR codes
          </div>
        </div>
      </div>
    </section>
  );

  const renderValidationStep = () => (
    <section className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-fg md:text-4xl">
          Validate & Preview
        </h1>
        <p className="mt-2 text-muted">
          Review your data before generating QR codes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="border border-border bg-white p-5">
          <div className="font-serif text-3xl text-fg">
            {parsedRows.length.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Total Rows
          </div>
        </div>
        <div className="border border-border bg-white p-5">
          <div className="font-serif text-3xl text-green-600">
            {validRows.length.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Valid Entries
          </div>
        </div>
        <div className="border border-border bg-white p-5">
          <div className="font-serif text-3xl text-yellow-600">
            {duplicateRows.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Duplicates
          </div>
        </div>
        <div className="border border-border bg-white p-5">
          <div className="font-serif text-3xl text-red-600">
            {errorRows.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Errors
          </div>
        </div>
      </div>

      {/* Error List */}
      {errorRows.length > 0 && (
        <div className="mb-8 border border-red-500 bg-red-50">
          <div className="flex items-center gap-3 border-b border-red-500 p-4">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h4 className="font-semibold text-red-600">
              {errorRows.length} rows have errors
            </h4>
          </div>
          <div className="p-4">
            {errorRows.slice(0, 10).map((row) => (
              <div
                key={row.rowNumber}
                className="flex items-center justify-between border-b border-red-200 py-2 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-red-600">
                    Row {row.rowNumber}
                  </span>
                  <span className="text-sm">{row.errorMessage}</span>
                </div>
                <button
                  onClick={() => toggleExcludeRow(row.rowNumber)}
                  className={`border px-3 py-1 text-xs transition-colors ${
                    excludedRows.has(row.rowNumber)
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-red-500 bg-white text-red-600 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  {excludedRows.has(row.rowNumber) ? "Include" : "Exclude"}
                </button>
              </div>
            ))}
            {errorRows.length > 10 && (
              <p className="mt-2 text-xs text-muted">
                +{errorRows.length - 10} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sample Preview */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Sample Preview
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {validRows.slice(0, 5).map((row) => (
            <div
              key={row.rowNumber}
              className="border border-border bg-white p-4 text-center"
            >
              <div className="mx-auto mb-3 h-24 w-24 bg-surface p-2">
                <LivePreview
                  template={template}
                  content={row.content}
                  size={80}
                />
              </div>
              <div className="text-xs text-muted">Row {row.rowNumber}</div>
              <div className="truncate text-sm font-medium">{row.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="border border-border bg-surface p-4 text-sm text-muted">
        <strong className="text-fg">Estimated generation time:</strong> ~
        {Math.ceil(validRows.length / 20)} seconds for{" "}
        {validRows.length.toLocaleString()} codes
      </div>
    </section>
  );

  const renderGenerationStep = () => (
    <section className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-fg md:text-4xl">
          Generating QR Codes
        </h1>
        <p className="mt-2 text-muted">
          Please wait while we create your QR codes
        </p>
      </div>

      {/* Progress Container */}
      <div className="mb-6 border border-border bg-white p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl">Processing batch...</h3>
          <span className="text-sm text-muted">
            {progress.current} of {progress.total}
          </span>
        </div>
        <div className="mb-4 h-2 overflow-hidden bg-surface">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{
              width: `${
                progress.total > 0
                  ? (progress.current / progress.total) * 100
                  : 0
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>
            {progress.total > 0
              ? Math.round((progress.current / progress.total) * 100)
              : 0}
            % complete
          </span>
          <span>
            ~{Math.ceil((progress.total - progress.current) / 50)} seconds
            remaining
          </span>
        </div>
      </div>

      {/* Generation Log */}
      <div
        ref={logContainerRef}
        className="h-48 overflow-y-auto border border-border bg-fg p-4 font-mono text-xs text-bg"
      >
        {generationLogs.map((log, i) => (
          <div key={i} className="flex gap-3 py-1">
            <span className="text-gray-500">{log.time}</span>
            <span
              className={
                log.type === "success" ? "text-green-400" : "text-red-400"
              }
            >
              {log.message}
            </span>
          </div>
        ))}
        {isGenerating && (
          <div className="animate-pulse py-1 text-gray-500">Processing...</div>
        )}
      </div>
    </section>
  );

  const renderDownloadStep = () => (
    <section className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-fg md:text-4xl">
          Download Your QR Codes
        </h1>
        <p className="mt-2 text-muted">Choose your preferred format</p>
      </div>

      {/* Success Banner */}
      <div className="mb-8 flex items-center gap-4 border border-green-500 bg-green-50 p-6">
        <div className="flex h-12 w-12 items-center justify-center bg-green-500 text-white">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <h3 className="font-serif text-xl">
            Successfully generated{" "}
            {progress.generatedCodes.length.toLocaleString()} QR codes
          </h3>
          <p className="text-sm text-muted">
            {progress.errors.length} rows were skipped due to errors
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ZIP Download */}
        <div
          onClick={() =>
            setDownloadSettings((prev) => ({ ...prev, mode: "zip" }))
          }
          className={`cursor-pointer border-2 bg-white p-6 transition-all ${
            downloadSettings.mode === "zip"
              ? "border-accent bg-accent-light"
              : "border-border hover:border-accent"
          }`}
        >
          <div className="mb-4 flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center ${
                downloadSettings.mode === "zip"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted"
              }`}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h4 className="font-serif text-lg">ZIP Archive</h4>
          </div>
          <p className="mb-4 text-sm text-muted">
            Download all QR codes as individual files in a ZIP archive
          </p>

          {downloadSettings.mode === "zip" && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Format
                  </label>
                  <select
                    value={downloadSettings.format}
                    onChange={(e) =>
                      setDownloadSettings((prev) => ({
                        ...prev,
                        format: e.target.value as DownloadFormat,
                      }))
                    }
                    className="w-full border border-border bg-white p-2 text-sm"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="pdf">PDF</option>
                    <option value="eps">EPS</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Resolution
                  </label>
                  <select
                    value={downloadSettings.resolution}
                    onChange={(e) =>
                      setDownloadSettings((prev) => ({
                        ...prev,
                        resolution: Number(e.target.value) as Resolution,
                      }))
                    }
                    className="w-full border border-border bg-white p-2 text-sm"
                  >
                    <option value="72">72 DPI (Screen)</option>
                    <option value="150">150 DPI</option>
                    <option value="300">300 DPI (Print)</option>
                    <option value="600">600 DPI (High Quality)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Filename Pattern
                </label>
                <input
                  type="text"
                  value={downloadSettings.filenamePattern}
                  onChange={(e) =>
                    setDownloadSettings((prev) => ({
                      ...prev,
                      filenamePattern: e.target.value,
                    }))
                  }
                  placeholder="{label}-{row_number}"
                  className="w-full border border-border bg-white p-2 text-sm"
                />
              </div>
              <button
                onClick={downloadZip}
                disabled={isDownloading}
                className="flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-fg disabled:opacity-50"
              >
                {isDownloading ? (
                  "Preparing download..."
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download ZIP
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* PDF Download */}
        <div
          onClick={() =>
            setDownloadSettings((prev) => ({ ...prev, mode: "pdf" }))
          }
          className={`cursor-pointer border-2 bg-white p-6 transition-all ${
            downloadSettings.mode === "pdf"
              ? "border-accent bg-accent-light"
              : "border-border hover:border-accent"
          }`}
        >
          <div className="mb-4 flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center ${
                downloadSettings.mode === "pdf"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted"
              }`}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h4 className="font-serif text-lg">Multi-page PDF</h4>
          </div>
          <p className="mb-4 text-sm text-muted">
            Generate a single PDF with multiple QR codes per page
          </p>

          {downloadSettings.mode === "pdf" && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Page Size
                  </label>
                  <select
                    value={downloadSettings.pageSize}
                    onChange={(e) =>
                      setDownloadSettings((prev) => ({
                        ...prev,
                        pageSize: e.target.value as PageSize,
                      }))
                    }
                    className="w-full border border-border bg-white p-2 text-sm"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Grid Layout
                  </label>
                  <select
                    value={downloadSettings.gridLayout}
                    onChange={(e) =>
                      setDownloadSettings((prev) => ({
                        ...prev,
                        gridLayout: e.target.value as GridLayout,
                      }))
                    }
                    className="w-full border border-border bg-white p-2 text-sm"
                  >
                    <option value="2x2">2 x 2</option>
                    <option value="3x3">3 x 3</option>
                    <option value="4x4">4 x 4</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={downloadSettings.includeLabels}
                  onChange={(e) =>
                    setDownloadSettings((prev) => ({
                      ...prev,
                      includeLabels: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Include labels below QR codes
              </label>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-fg disabled:opacity-50"
              >
                {isDownloading ? (
                  "Preparing download..."
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF (
                    {Math.ceil(
                      progress.generatedCodes.length /
                        (downloadSettings.gridLayout === "2x2"
                          ? 4
                          : downloadSettings.gridLayout === "3x3"
                            ? 9
                            : 16)
                    )}{" "}
                    pages)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[280px_1fr]">
        {/* Sidebar Stepper */}
        <aside className="hidden border-r border-border bg-white p-8 lg:block">
          <div className="mb-6 text-[10px] font-bold uppercase tracking-wider text-muted">
            Bulk Creation
          </div>
          <nav className="space-y-0">
            {[
              {
                step: 1,
                title: "Upload Data",
                description: "CSV or Excel file",
              },
              {
                step: 2,
                title: "Design Template",
                description: "Customize QR style",
              },
              {
                step: 3,
                title: "Validate & Preview",
                description: "Check for errors",
              },
              {
                step: 4,
                title: "Generate Batch",
                description: "Process all codes",
              },
              { step: 5, title: "Download", description: "ZIP or PDF" },
            ].map(({ step, title, description }, index) => (
              <div
                key={step}
                className={`relative flex cursor-pointer gap-4 ${
                  index < 4 ? "pb-8" : ""
                }`}
                onClick={() => goToStep(step as WizardStep)}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center border-2 text-sm font-bold ${
                      completedSteps.has(step as WizardStep)
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step
                          ? "border-accent bg-accent text-white"
                          : "border-border bg-white text-muted"
                    }`}
                  >
                    {completedSteps.has(step as WizardStep) ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {index < 4 && (
                    <div
                      className={`h-full w-0.5 ${
                        completedSteps.has(step as WizardStep)
                          ? "bg-green-500"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div
                    className={`text-sm font-semibold ${
                      currentStep === step ||
                      completedSteps.has(step as WizardStep)
                        ? "text-fg"
                        : "text-muted"
                    }`}
                  >
                    {title}
                  </div>
                  <div className="text-xs text-muted">{description}</div>
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="p-6 md:p-10">
          <div className="mx-auto max-w-4xl">
            {renderStepContent()}

            {/* Footer Navigation */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <button
                onClick={currentStep === 5 ? resetWizard : handlePrevious}
                className="flex items-center gap-2 border border-border bg-white px-5 py-3 font-medium transition-colors hover:border-fg"
              >
                {currentStep === 5 ? (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Another Batch
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {currentStep === 1 ? "Home" : "Back"}
                  </>
                )}
              </button>

              {currentStep < 5 && (
                <button
                  onClick={handleNext}
                  disabled={
                    !canProceed() || (currentStep === 4 && isGenerating)
                  }
                  className="flex items-center gap-2 bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-fg disabled:opacity-50"
                >
                  {currentStep === 3 ? (
                    <>
                      Generate {validRows.length.toLocaleString()} QR Codes
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : currentStep === 4 ? (
                    isGenerating ? (
                      "Generating..."
                    ) : (
                      <>
                        Continue to Download
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )
                  ) : (
                    <>
                      Continue
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Hidden canvas */}
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
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function PatternPreview({ pattern }: { pattern: BodyPattern }) {
  const cells = [
    [1, 1, 0, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 0],
    [1, 1, 0, 1],
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
      case "diamond":
        return "rotate-45 scale-[0.6]";
      default:
        return "";
    }
  };

  return (
    <div className="grid aspect-square w-8 grid-cols-4 gap-[2px] border border-border bg-surface p-1">
      {cells.flat().map((cell, i) => (
        <div key={i} className={`${cell ? `bg-fg ${getCellClass()}` : ""}`} />
      ))}
    </div>
  );
}

function EyeFramePreview({ style }: { style: EyeFrameStyle }) {
  const frameClass = {
    square: "rounded-none",
    rounded: "rounded-lg",
    circle: "rounded-full",
    "left-leaf": "rounded-[0_50%_0_50%]",
    "right-leaf": "rounded-[50%_0_50%_0]",
  }[style];

  return (
    <div className="relative h-8 w-8">
      <div
        className={`absolute h-full w-full border-[3px] border-fg ${frameClass}`}
      />
    </div>
  );
}

function EyeBallPreview({ style }: { style: EyeBallStyle }) {
  const ballClass = {
    square: "rounded-none",
    rounded: "rounded-[2px]",
    circle: "rounded-full",
    diamond: "rotate-45",
  }[style];

  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <div className={`h-3 w-3 bg-fg ${ballClass}`} />
    </div>
  );
}

function LivePreview({
  template,
  content,
  size = 150,
}: {
  template: TemplateSettings;
  content: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const generatePreview = async () => {
      if (!content) return;

      try {
        const qrData = await QRCode.create(content, {
          errorCorrectionLevel: template.errorCorrection,
        });

        const modules = qrData.modules;
        const moduleSize = modules.size;
        const canvas = document.createElement("canvas");
        const scale = 4;
        const margin = 2;
        const canvasSize = (moduleSize + margin * 2) * scale;

        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d")!;

        // Background
        ctx.fillStyle = template.bgColor;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Draw modules
        ctx.fillStyle = template.fgColor;

        for (let row = 0; row < moduleSize; row++) {
          for (let col = 0; col < moduleSize; col++) {
            if (modules.get(row, col)) {
              const x = (col + margin) * scale;
              const y = (row + margin) * scale;
              const padding = scale * 0.1;
              const innerSize = scale - padding * 2;

              ctx.beginPath();

              switch (template.bodyPattern) {
                case "dots":
                  ctx.arc(
                    x + scale / 2,
                    y + scale / 2,
                    innerSize / 2,
                    0,
                    Math.PI * 2
                  );
                  break;
                case "rounded":
                  ctx.roundRect(
                    x + padding,
                    y + padding,
                    innerSize,
                    innerSize,
                    innerSize * 0.3
                  );
                  break;
                default:
                  ctx.rect(x + padding, y + padding, innerSize, innerSize);
              }

              ctx.fill();
            }
          }
        }

        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        // Ignore errors
      }
    };

    generatePreview();
  }, [content, template]);

  if (!dataUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <svg
          className="h-8 w-8 text-border"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QR preview"
      className="h-full w-full object-contain"
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
}
