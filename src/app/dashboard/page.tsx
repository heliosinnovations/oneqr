"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/client";
import FolderSidebar, { Folder } from "@/components/dashboard/FolderSidebar";
import FolderModal from "@/components/dashboard/FolderModal";
import QRCodeCard, { QRCodeData } from "@/components/dashboard/QRCodeCard";
import BulkActionsBar from "@/components/dashboard/BulkActionsBar";
import SearchBar, {
  DateFilter,
  SortOption,
} from "@/components/dashboard/SearchBar";

interface Stats {
  total: number;
  totalScans: number;
  editable: number;
  static: number;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  // Core data
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set());
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalScans: 0,
    editable: 0,
    static: 0,
  });

  // Modal State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Bulk Action State
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Check if we need to force refresh (coming from payment success)
  const shouldRefresh = searchParams.get("refresh") === "true";

  // Clean up refresh param from URL after processing
  useEffect(() => {
    if (shouldRefresh) {
      router.replace("/dashboard");
    }
  }, [shouldRefresh, router]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from("qr_folders")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching folders:", error);
      return;
    }

    setFolders(data || []);
  }, [supabase]);

  // Fetch QR codes
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

    const codes = (data || []) as QRCodeData[];
    setQrCodes(codes);

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

  // Initial data fetch
  useEffect(() => {
    fetchFolders();
    fetchQRCodes();
  }, [fetchFolders, fetchQRCodes, shouldRefresh]);

  // Calculate folder counts
  const qrCountByFolder = qrCodes.reduce(
    (acc, qr) => {
      if (qr.folder_id) {
        acc[qr.folder_id] = (acc[qr.folder_id] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const unorganizedCount = qrCodes.filter((qr) => !qr.folder_id).length;

  // Filter and sort QR codes
  const getFilteredQRCodes = useCallback(() => {
    let filtered = [...qrCodes];

    // Filter by folder
    if (selectedFolderId === "unorganized") {
      filtered = filtered.filter((qr) => !qr.folder_id);
    } else if (selectedFolderId) {
      filtered = filtered.filter((qr) => qr.folder_id === selectedFolderId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (qr) =>
          qr.title.toLowerCase().includes(query) ||
          qr.destination_url.toLowerCase().includes(query)
      );
    }

    // Filter by date
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (dateFilter === "this_week") {
      filtered = filtered.filter((qr) => new Date(qr.created_at) >= oneWeekAgo);
    } else if (dateFilter === "this_month") {
      filtered = filtered.filter(
        (qr) => new Date(qr.created_at) >= oneMonthAgo
      );
    } else if (dateFilter === "older") {
      filtered = filtered.filter((qr) => new Date(qr.created_at) < oneMonthAgo);
    }

    // Sort
    switch (sortOption) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "most_scanned":
        filtered.sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0));
        break;
      case "a_z":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [qrCodes, selectedFolderId, searchQuery, dateFilter, sortOption]);

  const filteredCodes = getFilteredQRCodes();

  // Folder actions
  const handleCreateFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleSaveFolder = async (name: string, color: string) => {
    if (editingFolder) {
      // Update existing folder
      const { error } = await supabase
        .from("qr_folders")
        .update({ name, color })
        .eq("id", editingFolder.id);

      if (error) throw error;
    } else {
      // Create new folder
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("qr_folders").insert({
        name,
        color,
        user_id: user.id,
      });

      if (error) throw error;
    }

    fetchFolders();
  };

  const handleDeleteFolder = async (folderId: string) => {
    const { error } = await supabase
      .from("qr_folders")
      .delete()
      .eq("id", folderId);

    if (error) {
      console.error("Error deleting folder:", error);
      return;
    }

    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }

    fetchFolders();
    fetchQRCodes(); // Refresh to update folder_id references
  };

  // QR Code actions
  const handleDeleteQR = async (qrId: string) => {
    const { error } = await supabase.from("qr_codes").delete().eq("id", qrId);

    if (error) {
      console.error("Error deleting QR code:", error);
      return;
    }

    setQrCodes((prev) => prev.filter((qr) => qr.id !== qrId));
    setSelectedQRs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(qrId);
      return newSet;
    });
  };

  const handleDuplicateQR = async (qrId: string) => {
    const original = qrCodes.find((q) => q.id === qrId);
    if (!original) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        user_id: user.id,
        title: `${original.title} (Copy)`,
        destination_url: original.destination_url,
        short_code: `${original.short_code}-${Date.now().toString(36)}`,
        qr_data: original.qr_data,
        folder_id: original.folder_id,
        is_editable: false, // Copies are not editable by default
      })
      .select()
      .single();

    if (error) {
      console.error("Error duplicating QR code:", error);
      alert("Failed to duplicate QR code");
      return;
    }

    router.push(`/edit/${data.id}`);
  };

  const handleMoveToFolder = async (qrId: string, folderId: string | null) => {
    const { error } = await supabase
      .from("qr_codes")
      .update({ folder_id: folderId })
      .eq("id", qrId);

    if (error) {
      console.error("Error moving QR code:", error);
      return;
    }

    setQrCodes((prev) =>
      prev.map((qr) => (qr.id === qrId ? { ...qr, folder_id: folderId } : qr))
    );
  };

  const handleDownloadQR = async (qr: QRCodeData, format: "png" | "svg") => {
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

  // Selection actions
  const handleSelectQR = (qrId: string, selected: boolean) => {
    setSelectedQRs((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(qrId);
      } else {
        newSet.delete(qrId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedQRs(new Set(filteredCodes.map((qr) => qr.id)));
  };

  const handleDeselectAll = () => {
    setSelectedQRs(new Set());
  };

  // Bulk actions
  const handleBulkMoveToFolder = async (folderId: string | null) => {
    const ids = Array.from(selectedQRs);
    const { error } = await supabase
      .from("qr_codes")
      .update({ folder_id: folderId })
      .in("id", ids);

    if (error) {
      console.error("Error moving QR codes:", error);
      return;
    }

    setQrCodes((prev) =>
      prev.map((qr) =>
        selectedQRs.has(qr.id) ? { ...qr, folder_id: folderId } : qr
      )
    );
    setSelectedQRs(new Set());
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedQRs.size} QR code(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const ids = Array.from(selectedQRs);
    const { error } = await supabase.from("qr_codes").delete().in("id", ids);

    if (error) {
      console.error("Error deleting QR codes:", error);
      setIsDeleting(false);
      return;
    }

    setQrCodes((prev) => prev.filter((qr) => !selectedQRs.has(qr.id)));
    setSelectedQRs(new Set());
    setIsDeleting(false);
  };

  const handleBulkDownloadZip = async () => {
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      for (const qrId of selectedQRs) {
        const qr = qrCodes.find((q) => q.id === qrId);
        if (!qr) continue;

        const dataUrl = await QRCode.toDataURL(qr.destination_url, {
          width: 1024,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
        const base64Data = dataUrl.split(",")[1];
        const fileName = `${qr.title.replace(/\s+/g, "-")}-qr.png`;
        zip.file(fileName, base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-codes.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      alert("Failed to download ZIP file");
    }

    setIsDownloading(false);
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
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] lg:hidden"
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        {selectedFolderId === null
          ? "All QR Codes"
          : selectedFolderId === "unorganized"
            ? "Unorganized"
            : folders.find((f) => f.id === selectedFolderId)?.name || "Folder"}
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="ml-auto h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-6 shadow-xl transition-transform lg:relative lg:z-auto lg:w-64 lg:translate-x-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h2 className="font-serif text-lg text-[var(--fg)]">Folders</h2>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={(folderId) => {
            setSelectedFolderId(folderId);
            setShowMobileSidebar(false);
          }}
          onCreateFolder={handleCreateFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          qrCountByFolder={qrCountByFolder}
          unorganizedCount={unorganizedCount}
          totalCount={stats.total}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[var(--fg)] sm:text-4xl">
              {selectedFolderId === null
                ? "All QR Codes"
                : selectedFolderId === "unorganized"
                  ? "Unorganized"
                  : folders.find((f) => f.id === selectedFolderId)?.name ||
                    "My QR Codes"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {stats.total} QR codes &middot; Unlimited storage
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
              Editable
            </div>
            <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
              {stats.editable}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Static
            </div>
            <div className="mt-1 font-serif text-3xl text-[var(--fg)]">
              {stats.static}
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
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
                : selectedFolderId === "unorganized"
                  ? "No unorganized QR codes"
                  : selectedFolderId
                    ? "This folder is empty"
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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCodes.map((qr) => (
              <QRCodeCard
                key={qr.id}
                qr={qr}
                qrDataUrl={qrDataUrls[qr.id] || null}
                folders={folders}
                isSelected={selectedQRs.has(qr.id)}
                onSelect={(selected) => handleSelectQR(qr.id, selected)}
                onDelete={() => handleDeleteQR(qr.id)}
                onDuplicate={() => handleDuplicateQR(qr.id)}
                onMoveToFolder={(folderId) =>
                  handleMoveToFolder(qr.id, folderId)
                }
                onDownload={(format) => handleDownloadQR(qr, format)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedQRs.size}
        totalCount={filteredCodes.length}
        folders={folders}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onMoveToFolder={handleBulkMoveToFolder}
        onDelete={handleBulkDelete}
        onDownloadZip={handleBulkDownloadZip}
        isDownloading={isDownloading}
        isDeleting={isDeleting}
      />

      {/* Folder Modal */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setEditingFolder(null);
        }}
        onSave={handleSaveFolder}
        editingFolder={editingFolder}
      />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
        <p className="text-[var(--muted)]">Loading your QR codes...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
