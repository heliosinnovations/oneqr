"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";

interface QRCodeData {
  id: string;
  title: string;
  short_code: string;
  destination_url: string;
  is_editable: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

interface ScanData {
  day: string;
  count: number;
}

export default function QRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  // Check URL params for modal triggers and refresh
  const shouldRefresh = searchParams.get("refresh") === "true";

  // Redirect to edit page if edit or upgrade param is present
  useEffect(() => {
    if (searchParams.get("edit") === "true" || searchParams.get("upgrade") === "true") {
      router.push(`/edit/${id}`);
    }
  }, [searchParams, router, id]);

  // Clean up refresh param from URL after processing (prevents refetch on back/forward)
  useEffect(() => {
    if (shouldRefresh) {
      // Remove refresh param from URL to prevent repeated refetches
      const newUrl = `/dashboard/${id}${searchParams.get("edit") === "true" ? "?edit=true" : ""}`;
      router.replace(newUrl);
    }
  }, [shouldRefresh, id, router, searchParams]);

  // Fetch QR code details
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

    // Generate QR code preview
    try {
      const dataUrl = await QRCode.toDataURL(data.destination_url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#f7f6f1",
        },
      });
      setQrDataUrl(dataUrl);
    } catch {
      // Silent fail
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

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      scansByDay[dayName] = 0;
    }

    // Count scans per day
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
    // When shouldRefresh is true (coming from payment), refetch to get updated is_editable status
  }, [fetchQRCode, shouldRefresh]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this QR code? This action cannot be undone."
      )
    )
      return;

    setDeleting(true);
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting QR code:", error);
      alert("Failed to delete QR code");
      setDeleting(false);
    } else {
      router.push("/dashboard");
    }
  };

  const downloadQR = async (format: "png" | "svg") => {
    if (!qrCode) return;

    try {
      if (format === "png") {
        const dataUrl = await QRCode.toDataURL(qrCode.destination_url, {
          width: 1024,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${qrCode.title.replace(/\s+/g, "-")}-qr.png`;
        link.click();
      } else {
        const svgString = await QRCode.toString(qrCode.destination_url, {
          type: "svg",
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${qrCode.title.replace(/\s+/g, "-")}-qr.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading QR:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const maxScanCount = Math.max(...scanData.map((d) => d.count), 1);
  const weeklyScans = scanData.reduce((sum, d) => sum + d.count, 0);
  const avgScans = (weeklyScans / 7).toFixed(1);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
          <p className="text-[var(--muted)]">Loading QR code details...</p>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
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

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-[var(--muted)] no-underline transition-colors hover:text-[var(--accent)]"
        >
          Dashboard
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="font-medium text-[var(--fg)]">{qrCode.title}</span>
      </nav>

      {/* Detail Grid */}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* QR Preview Section */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-60 w-60 items-center justify-center rounded-xl bg-[var(--surface)]">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${qrCode.title}`}
                className="h-52 w-52"
              />
            ) : (
              <div className="h-52 w-52 animate-pulse rounded bg-[var(--border)]" />
            )}
          </div>

          <h2 className="mb-2 font-serif text-xl text-[var(--fg)]">
            {qrCode.title}
          </h2>
          <p className="mb-4 text-sm text-[var(--accent)]">
            theqrspot.com/r/{qrCode.short_code}
          </p>

          <div className="mb-6 flex justify-center gap-2">
            {qrCode.is_editable ? (
              <>
                <span className="inline-flex items-center rounded-full bg-[#d1e7dd] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#198754]">
                  Paid
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Dynamic
                </span>
              </>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Free
              </span>
            )}
          </div>

          {/* Download Options */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => downloadQR("png")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              PNG
            </button>
            <button
              onClick={() => downloadQR("svg")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              SVG
            </button>
          </div>

          {/* Print Button */}
          <Link
            href={`/print/${id}`}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print QR Code
          </Link>

          {/* Edit Button - Always shown */}
          <Link
            href={`/edit/${qrCode.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit QR Code
          </Link>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
            ) : (
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
            Delete QR Code
          </button>
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-6">
          {/* Current Destination */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg text-[var(--fg)]">
                Current Destination
              </h3>
              <Link
                href={`/edit/${qrCode.id}`}
                className="text-sm font-medium text-[var(--accent)] transition-colors hover:underline"
              >
                Edit
              </Link>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-[var(--surface)] p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)]">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-[var(--accent)]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Redirects to
                </div>
                <div className="mt-1 break-all text-sm text-[var(--fg)]">
                  {qrCode.destination_url}
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  Last updated: {formatDate(qrCode.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg text-[var(--fg)]">
                Scan Analytics
              </h3>
              <span className="text-sm font-medium text-[var(--accent)]">
                Last 7 days
              </span>
            </div>

            {/* Chart */}
            <div className="mb-4 h-48 overflow-hidden rounded-xl bg-[var(--surface)]">
              <div className="flex h-full items-end justify-between gap-2 px-6 py-4">
                {scanData.map(({ day, count }) => (
                  <div
                    key={day}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="w-full max-w-10 rounded-t bg-[var(--accent)] transition-all hover:bg-[#e64500]"
                      style={{
                        height: `${Math.max((count / maxScanCount) * 100, 5)}%`,
                        minHeight: "8px",
                      }}
                    />
                    <span className="text-[10px] uppercase text-[var(--muted)]">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-[var(--surface)] p-4 text-center">
                <div className="font-serif text-2xl text-[var(--fg)]">
                  {qrCode.scan_count}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Total Scans
                </div>
              </div>
              <div className="rounded-xl bg-[var(--surface)] p-4 text-center">
                <div className="font-serif text-2xl text-[var(--fg)]">
                  {weeklyScans}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  This Week
                </div>
              </div>
              <div className="rounded-xl bg-[var(--surface)] p-4 text-center">
                <div className="font-serif text-2xl text-[var(--fg)]">
                  {avgScans}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Avg/Day
                </div>
              </div>
              <div className="rounded-xl bg-[var(--surface)] p-4 text-center">
                <div className="font-serif text-2xl text-[var(--fg)]">
                  {qrCode.is_editable ? "1+" : "-"}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Total Edits
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h3 className="mb-4 font-serif text-lg text-[var(--fg)]">
              QR Code Info
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 rounded-lg bg-[var(--surface)] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)]">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-[var(--accent)]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-[var(--fg)]">Created</div>
                  <div className="text-xs text-[var(--muted)]">
                    {formatDateTime(qrCode.created_at)}
                  </div>
                </div>
              </div>
              {qrCode.updated_at !== qrCode.created_at && (
                <div className="flex items-center gap-4 rounded-lg bg-[var(--surface)] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)]">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-[var(--accent)]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[var(--fg)]">Last Updated</div>
                    <div className="text-xs text-[var(--muted)]">
                      {formatDateTime(qrCode.updated_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade CTA (only for non-editable) */}
          {!qrCode.is_editable && (
            <div className="rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#ff8c42] p-8 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mb-1 font-serif text-xl">
                    Unlock Editing and Analytics
                  </h3>
                  <p className="text-sm opacity-90">
                    $1.99 one-time. Edit this QR code forever.
                  </p>
                </div>
                <Link
                  href={`/edit/${qrCode.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--accent)] transition-transform hover:-translate-y-0.5"
                >
                  Unlock for $1.99
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
