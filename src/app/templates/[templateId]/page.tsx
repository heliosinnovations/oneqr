"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  templates,
  categories,
  getTemplateById,
  type Template,
  type TemplateId,
} from "@/lib/templates/types";
import { formatTemplateData } from "@/lib/templates/formatters";
import {
  getTemplateIcon,
  iconColorClasses,
  SearchIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  InfoIcon,
  WifiIcon,
  LockIcon,
  PhoneIcon,
  EmailIcon,
  GlobeIcon,
} from "@/components/templates/TemplateIcons";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/AuthModal";
import { User } from "@supabase/supabase-js";

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

// Get icon for specific field types
function getFieldIcon(fieldName: string, fieldType: string) {
  if (fieldName === "ssid" || fieldName.includes("wifi")) return WifiIcon;
  if (fieldType === "password") return LockIcon;
  if (fieldType === "tel" || fieldName === "phone") return PhoneIcon;
  if (fieldType === "email" || fieldName === "email") return EmailIcon;
  if (fieldType === "url" || fieldName === "website") return GlobeIcon;
  return null;
}

export default function TemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as TemplateId;

  // Get template
  const template = getTemplateById(templateId);

  // Form state - initialize with example data
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrContent, setQrContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [savedQrId, setSavedQrId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize form data with example data
  useEffect(() => {
    if (template) {
      setFormData(template.exampleData);
    }
  }, [template]);

  // Check user authentication status
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Generate QR code
  const generateQR = useCallback(async () => {
    if (!template) return;

    // Check required fields
    const missingFields = template.fields
      .filter((f) => f.required && !formData[f.name]?.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const content = formatTemplateData(template.id, formData);
      setQrContent(content);

      const dataUrl = await QRCode.toDataURL(content, {
        width: 512,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
      trackEvent.qrGenerated("template");
    } catch (error) {
      console.error("Error generating QR:", error);
      setQrDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [template, formData]);

  // Auto-generate QR code when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 300);
    return () => clearTimeout(timer);
  }, [formData, generateQR]);

  // Download PNG
  const downloadPNG = useCallback(() => {
    if (!qrDataUrl || !template) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${template.id}-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackEvent.qrDownloaded("png", "template");
  }, [qrDataUrl, template]);

  // Download SVG
  const downloadSVG = useCallback(async () => {
    if (!qrContent || !template) return;

    try {
      const svgString = await QRCode.toString(qrContent, {
        type: "svg",
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${template.id}-qr-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      trackEvent.qrDownloaded("svg", "template");
    } catch (error) {
      console.error("Error generating SVG:", error);
    }
  }, [qrContent, template]);

  // Copy content to clipboard
  const copyContent = useCallback(async () => {
    if (!qrContent) return;

    try {
      await navigator.clipboard.writeText(qrContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
    }
  }, [qrContent]);

  // Save QR code to database
  const saveQRCode = useCallback(async () => {
    if (!qrDataUrl || !qrContent || !template) return;

    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    // Generate title from template
    const title = `${template.name} QR`;

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
          destination_url: qrContent,
          is_editable: false,
          scan_count: 0,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505" && error.message.includes("short_code")) {
          retries--;
          continue;
        }
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
      setIsSaving(false);
      return;
    }

    setSaveStatus({
      type: "error",
      message: "Failed to generate unique code. Please try again.",
    });
    setIsSaving(false);
  }, [qrDataUrl, qrContent, template]);

  // Listen for auth state changes to auto-save after login
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && showAuthModal) {
        setShowAuthModal(false);
        saveQRCode();
      }
    });

    return () => subscription.unsubscribe();
  }, [showAuthModal, saveQRCode]);

  // Filter templates for sidebar
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const grouped: Record<string, Template[]> = {
      popular: [],
      communication: [],
      business: [],
    };
    filteredTemplates.forEach((t) => {
      grouped[t.category].push(t);
    });
    return grouped;
  }, [filteredTemplates]);

  // Handle template not found
  if (!template) {
    return (
      <>
        <Navigation />
        <main className="flex min-h-[60vh] items-center justify-center bg-surface p-8">
          <div className="text-center">
            <h1 className="mb-4 font-serif text-3xl">Template Not Found</h1>
            <p className="mb-6 text-muted">
              The template you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-fg"
            >
              Browse Templates
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = getTemplateIcon(template.id);

  return (
    <>
      <Navigation />

      {/* Page Layout */}
      <div className="grid min-h-[calc(100vh-60px)] lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] overflow-y-auto border-r border-border bg-white p-6 lg:block">
          <div className="mb-6">
            <h2 className="font-serif text-2xl">Templates</h2>
            <p className="text-sm text-muted">10 smart templates</p>
          </div>

          {/* Search */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <SearchIcon className="h-4 w-4 flex-shrink-0 text-muted" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>

          {/* Category Groups */}
          {categories.map((category) => {
            const categoryTemplates = groupedTemplates[category.id];
            if (!categoryTemplates || categoryTemplates.length === 0)
              return null;

            return (
              <div key={category.id} className="mb-6">
                <div className="mb-2 pl-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                  {category.label}
                </div>
                <ul className="space-y-1">
                  {categoryTemplates.map((t) => {
                    const TIcon = getTemplateIcon(t.id);
                    const isActive = t.id === templateId;
                    return (
                      <li key={t.id}>
                        <Link
                          href={`/templates/${t.id}`}
                          className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                            isActive
                              ? "border border-accent bg-accent-light"
                              : "hover:bg-surface"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses[t.id]}`}
                          >
                            <TIcon className="h-[18px] w-[18px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 text-sm font-semibold">
                              {t.name}
                            </div>
                            <div className="truncate text-xs text-muted">
                              {t.description}
                            </div>
                          </div>
                          {t.badge && (
                            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                              {t.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="bg-surface p-6 lg:p-12">
          <div className="mx-auto max-w-[800px]">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColorClasses[template.id]}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h1 className="font-serif text-3xl lg:text-4xl">
                  {template.name}
                </h1>
              </div>
              <p className="max-w-lg text-muted">
                {template.id === "wifi" &&
                  "Share your WiFi credentials instantly. Guests scan the QR code and connect automatically - no typing passwords."}
                {template.id === "vcard" &&
                  "Create a digital business card that saves directly to contacts when scanned."}
                {template.id === "whatsapp" &&
                  "Let people start a WhatsApp conversation with you in one scan."}
                {template.id === "email" &&
                  "Create a QR code that opens a pre-filled email when scanned."}
                {template.id === "sms" &&
                  "Generate a QR code that opens a text message when scanned."}
                {template.id === "phone" &&
                  "Create a tap-to-call QR code for instant phone calls."}
                {template.id === "app-store" &&
                  "Direct users to download your app from the App Store or Play Store."}
                {template.id === "maps" &&
                  "Share a location that opens in Google Maps with directions."}
                {template.id === "calendar" &&
                  "Create an event that saves directly to their calendar when scanned."}
                {template.id === "payment" &&
                  "Create a QR code for quick payments via PayPal, Venmo, or Cash App."}
              </p>
            </div>

            {/* Form Split Layout */}
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Form */}
              <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:p-8">
                {template.sections ? (
                  // Render fields by section
                  template.sections.map((section, sectionIndex) => (
                    <div
                      key={section.title}
                      className={sectionIndex > 0 ? "mt-6" : ""}
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">
                          {section.title}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      {/* Check if this section should use row layout (2 columns) */}
                      {section.fields.length === 2 &&
                      section.fields.every(
                        (fieldName) =>
                          template.fields.find((f) => f.name === fieldName)
                            ?.type === "text" ||
                          template.fields.find((f) => f.name === fieldName)
                            ?.type === "date" ||
                          template.fields.find((f) => f.name === fieldName)
                            ?.type === "time"
                      ) ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {section.fields.map((fieldName) => {
                            const field = template.fields.find(
                              (f) => f.name === fieldName
                            );
                            if (!field) return null;
                            return renderField(field);
                          })}
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {section.fields.map((fieldName) => {
                            const field = template.fields.find(
                              (f) => f.name === fieldName
                            );
                            if (!field) return null;
                            return renderField(field);
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Render all fields without sections
                  <div className="space-y-5">
                    {template.fields.map((field) => renderField(field))}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generateQR}
                  disabled={isGenerating}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors ${
                    template.id === "vcard"
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "bg-accent hover:bg-fg"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  {isGenerating
                    ? "Generating..."
                    : `Generate ${template.name} QR`}
                </button>
              </div>

              {/* Preview Panel */}
              <div className="lg:sticky lg:top-[100px] lg:self-start">
                <div className="rounded-2xl bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    Live Preview
                  </div>

                  {/* QR Code Preview */}
                  <div
                    className={`mx-auto mb-4 flex h-[180px] w-[180px] items-center justify-center rounded-xl border-2 ${
                      qrDataUrl
                        ? "border-green-500"
                        : "border-dashed border-border"
                    }`}
                  >
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="Generated QR code"
                        className="h-[140px] w-[140px] object-contain"
                      />
                    ) : (
                      <div className="flex h-[140px] w-[140px] items-center justify-center">
                        {isGenerating ? (
                          <div className="animate-pulse">
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
                        ) : (
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
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {qrDataUrl && (
                    <div className="mb-4 flex items-center justify-center gap-1.5 text-sm text-green-600">
                      <CheckIcon className="h-4 w-4" />
                      Ready to scan
                    </div>
                  )}

                  {/* Action Buttons */}
                  {qrDataUrl && (
                    <>
                      <div className="mb-4 flex gap-2">
                        <button
                          onClick={downloadPNG}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium transition-colors hover:border-fg hover:bg-surface"
                        >
                          <DownloadIcon className="h-4 w-4" />
                          PNG
                        </button>
                        <button
                          onClick={downloadSVG}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium transition-colors hover:border-fg hover:bg-surface"
                        >
                          <DownloadIcon className="h-4 w-4" />
                          SVG
                        </button>
                        <button
                          onClick={copyContent}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium transition-colors hover:border-fg hover:bg-surface"
                        >
                          {copied ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <CopyIcon className="h-4 w-4" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>

                      {/* Save to dashboard for logged-in users */}
                      {!userLoading && user && (
                        <>
                          {savedQrId ? (
                            <Link
                              href="/dashboard"
                              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-green-600 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                            >
                              <CheckIcon className="h-4 w-4" />
                              View in Dashboard
                            </Link>
                          ) : (
                            <button
                              onClick={saveQRCode}
                              disabled={isSaving}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-fg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                              >
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                              </svg>
                              {isSaving ? "Saving..." : "Save to Dashboard"}
                            </button>
                          )}
                        </>
                      )}

                      {/* Prompt for non-logged-in users */}
                      {!userLoading && !user && !savedQrId && (
                        <div className="border-accent/30 mt-2 rounded-lg border bg-accent-light p-3 text-left">
                          <p className="mb-2 text-sm text-fg">
                            💾 Want to save and manage your QR codes?
                          </p>
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fg"
                          >
                            Create Free Account
                          </button>
                        </div>
                      )}

                      {/* Save status */}
                      {saveStatus && !savedQrId && (
                        <div
                          className={`mt-2 rounded border p-2 text-center text-sm ${
                            saveStatus.type === "success"
                              ? "border-green-600 bg-green-50 text-green-800"
                              : "border-red-600 bg-red-50 text-red-800"
                          }`}
                        >
                          {saveStatus.message}
                        </div>
                      )}

                      <Link
                        href="/generator?advanced=true"
                        className="mt-4 block text-sm text-accent hover:underline"
                      >
                        Customize colors & style →
                      </Link>
                    </>
                  )}
                </div>

                {/* Info Panel */}
                <div className="mt-4 rounded-xl bg-accent-light p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <InfoIcon className="h-4 w-4 text-accent" />
                    How it works
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    {template.id === "wifi" &&
                      "When someone scans this QR code, their phone will automatically connect to your WiFi network. Works on iPhone, Android, and most modern devices."}
                    {template.id === "vcard" &&
                      "When scanned, the contact info will be added to the phone's contacts app. Compatible with all smartphones."}
                    {template.id === "whatsapp" &&
                      "Scanning opens WhatsApp with your number pre-filled. If a message is included, it will be pre-populated too."}
                    {template.id === "email" &&
                      "Opens the default email app with your address, subject, and body pre-filled. Works on all devices."}
                    {template.id === "sms" &&
                      "Opens the messaging app with your number and message pre-filled. Works on all phones."}
                    {template.id === "phone" &&
                      "Scanning initiates a phone call to the number. The user will see a confirmation before dialing."}
                    {template.id === "app-store" &&
                      "Takes users directly to your app listing in the App Store or Play Store."}
                    {template.id === "maps" &&
                      "Opens Google Maps with the location and offers navigation. Works on all devices."}
                    {template.id === "calendar" &&
                      "Adds the event to the user's calendar app with all details. Works with Google Calendar, Apple Calendar, and Outlook."}
                    {template.id === "payment" &&
                      "Opens the payment app with your username and amount pre-filled for quick payments."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">2M+</div>
                <div className="text-xs text-muted">QR codes created</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">Free</div>
                <div className="text-xs text-muted">Forever</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">∞</div>
                <div className="text-xs text-muted">Edits allowed</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );

  // Helper function to render form fields
  function renderField(field: Template["fields"][number]) {
    const FieldIcon = getFieldIcon(field.name, field.type);
    const value = formData[field.name] || "";

    return (
      <div key={field.name} className="form-group">
        <label className="mb-2 block text-[13px] font-semibold text-fg">
          {field.label}
          {field.required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : (
            <span className="ml-1 text-xs font-normal text-muted">
              (optional)
            </span>
          )}
        </label>

        {field.type === "select" ? (
          // Security Type Toggle (special handling for wifi)
          field.name === "security" ? (
            <div className="flex rounded-lg bg-surface p-1">
              {field.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: option.value,
                    }))
                  }
                  className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    value === option.value
                      ? "bg-white text-fg shadow-sm"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            // Regular Select
            <select
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              className="w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)]"
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        ) : field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
            }
            placeholder={field.placeholder}
            rows={3}
            className="placeholder:text-muted/60 w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)]"
          />
        ) : (
          <div className="relative">
            {FieldIcon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                <FieldIcon className="h-[18px] w-[18px]" />
              </div>
            )}
            <input
              type={field.type === "password" ? "text" : field.type}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              placeholder={field.placeholder}
              className={`placeholder:text-muted/60 w-full rounded-lg border-[1.5px] border-border bg-white py-3 text-[15px] outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] ${
                FieldIcon ? "pl-10 pr-4" : "px-4"
              }`}
            />
          </div>
        )}

        {field.hint && (
          <p className="mt-1.5 text-xs text-muted">{field.hint}</p>
        )}
      </div>
    );
  }
}
