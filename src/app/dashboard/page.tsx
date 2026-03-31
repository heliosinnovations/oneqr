"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

interface Stats {
  total: number;
  totalScans: number;
  editable: number;
  static: number;
}

type FilterType = "all" | "editable" | "static";

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalScans: 0,
    editable: 0,
    static: 0,
  });
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch QR codes from Supabase
  const fetchQRCodes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching QR codes:", error);
      setLoading(false);
      return;
    }

    const codes = data || [];
    setQrCodes(codes);
    setFilteredCodes(codes);

    // Calculate stats
    const totalScans = codes.reduce(
      (sum: number, qr: QRCodeData) => sum + (qr.scan_count || 0),
      0
    );
    const editable = codes.filter((qr: QRCodeData) => qr.is_editable).length;
    setStats({
      total: codes.length,
      totalScans,
      editable,
      static: codes.length - editable,
    });

    // Generate QR code previews
    const urls: Record<string, string> = {};
    for (const qr of codes) {
      try {
        const dataUrl = await QRCode.toDataURL(qr.destination_url, {
          width: 128,
          margin: 1,
          color: {
            dark: "#1a1a1a",
            light: "#f7f6f1",
          },
        });
        urls[qr.id] = dataUrl;
      } catch {
        // Silent fail
      }
    }
    setQrDataUrls(urls);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...qrCodes];

    // Apply filter
    if (filter === "editable") {
      filtered = filtered.filter((qr) => qr.is_editable);
    } else if (filter === "static") {
      filtered = filtered.filter((qr) => !qr.is_editable);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (qr) =>
          qr.title.toLowerCase().includes(query) ||
          qr.destination_url.toLowerCase().includes(query) ||
          qr.short_code.toLowerCase().includes(query)
      );
    }

    setFilteredCodes(filtered);
  }, [qrCodes, filter, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    setDeleting(id);
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting QR code:", error);
      alert("Failed to delete QR code");
    } else {
      setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
    }
    setDeleting(null);
  };

  const downloadQR = async (qr: QRCodeData, format: "png" | "svg") => {
    try {
      if (format === "png") {
        const dataUrl = await QRCode.toDataURL(qr.destination_url, {
          width: 1024,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${qr.title.replace(/\s+/g, "-")}-qr.png`;
        link.click();
      } else {
        const svgString = await QRCode.toString(qr.destination_url, {
          type: "svg",
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${qr.title.replace(/\s+/g, "-")}-qr.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading QR:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
          <p className="text-[var(--muted)]">Loading your QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[var(--fg)] sm:text-4xl">
            My QR Codes
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage and track all your QR codes
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New QR
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Total QR Codes
          </div>
          <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
            {stats.total}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Total Scans
          </div>
          <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
            {stats.totalScans.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Editable (Paid)
          </div>
          <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
            {stats.editable}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Static (Free)
          </div>
          <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
            {stats.static}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-[var(--surface)] p-1">
          {(["all", "editable", "static"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-sm transition-all ${
                filter === f
                  ? "bg-white text-[var(--fg)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search QR codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-w-[250px] rounded-lg border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      {/* QR Cards Grid or Empty State */}
      {filteredCodes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center">
          <svg
            className="mx-auto mb-6 h-16 w-16 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="7" height="7" strokeWidth={1.5} />
            <rect x="14" y="3" width="7" height="7" strokeWidth={1.5} />
            <rect x="3" y="14" width="7" height="7" strokeWidth={1.5} />
            <rect x="14" y="14" width="4" height="4" strokeWidth={1.5} />
            <rect x="17" y="17" width="4" height="4" strokeWidth={1.5} />
          </svg>
          <h3 className="mb-2 font-serif text-xl text-[var(--fg)]">
            {searchQuery
              ? "No QR codes found"
              : filter !== "all"
                ? `No ${filter} QR codes yet`
                : "No QR codes yet"}
          </h3>
          <p className="mb-6 text-sm text-[var(--muted)]">
            {searchQuery
              ? "Try a different search term"
              : "Create your first QR code to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-[#e64500]"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New QR
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCodes.map((qr) => (
            <div
              key={qr.id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex gap-4 p-6">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface)]">
                  {qrDataUrls[qr.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrls[qr.id]}
                      alt={`QR code for ${qr.title}`}
                      className="h-16 w-16"
                    />
                  ) : (
                    <div className="h-16 w-16 animate-pulse rounded bg-[var(--border)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-[var(--fg)]">
                    {qr.title}
                  </h3>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {qr.destination_url}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {qr.is_editable ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d1e7dd] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#198754]">
                          Paid
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                          Dynamic
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Free
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Stats */}
              <div className="grid grid-cols-3 gap-2 bg-[var(--surface)] px-4 py-4">
                <div className="text-center">
                  <div className="text-base font-bold text-[var(--fg)]">
                    {qr.scan_count || 0}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    Scans
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-[var(--fg)]">
                    {formatDate(qr.created_at)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    Created
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-[var(--fg)]">
                    {qr.is_editable ? "∞" : "-"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    Edits
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-4 gap-2 border-t border-[var(--border)] p-4">
                <Link
                  href={`/dashboard/${qr.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2 py-2.5 text-xs font-medium text-[var(--fg)] no-underline transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View
                </Link>
                {qr.is_editable ? (
                  <Link
                    href={`/dashboard/${qr.id}?edit=true`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-2 py-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-[#e64500]"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/${qr.id}?upgrade=true`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-2 py-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-[#e64500]"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Unlock
                  </Link>
                )}
                <button
                  onClick={() => downloadQR(qr, "png")}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2 py-2.5 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  DL
                </button>
                <button
                  onClick={() => handleDelete(qr.id)}
                  disabled={deleting === qr.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2 py-2.5 text-xs font-medium text-[var(--fg)] transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                >
                  {deleting === qr.id ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border)] border-t-red-500" />
                  ) : (
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
