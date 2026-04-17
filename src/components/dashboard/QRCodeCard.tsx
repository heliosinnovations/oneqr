"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder } from "./FolderSidebar";

export interface QRCodeData {
  id: string;
  title: string;
  short_code: string;
  destination_url: string;
  is_editable: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
  folder_id: string | null;
  qr_data?: Record<string, unknown>;
  qr_type?: "static" | "dynamic";
  edit_count?: number;
  is_paid?: boolean;
}

interface QRCodeCardProps {
  qr: QRCodeData;
  qrDataUrl: string | null;
  folders: Folder[];
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  onDownload: (format: "png" | "svg") => void;
}

export default function QRCodeCard({
  qr,
  qrDataUrl,
  folders,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveToFolder,
  onDownload,
}: QRCodeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;
    setDeleting(true);
    onDelete();
  };

  const currentFolder = folders.find((f) => f.id === qr.folder_id);

  return (
    <div
      className={`group overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        isSelected
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-20"
          : "border-[var(--border)]"
      }`}
    >
      {/* Selection Checkbox */}
      <div className="relative">
        <div
          className={`absolute left-3 top-3 z-10 transition-opacity ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </label>
        </div>

        {/* Actions Menu Button */}
        <div className="absolute right-3 top-3 z-10">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg bg-white/90 p-1.5 text-[var(--muted)] opacity-0 shadow-sm backdrop-blur transition-all hover:text-[var(--fg)] group-hover:opacity-100"
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowMenu(false);
                  setShowMoveMenu(false);
                }}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg">
                <Link
                  href={`/dashboard/${qr.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] no-underline transition-colors hover:bg-[var(--surface)]"
                  onClick={() => setShowMenu(false)}
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Details
                </Link>
                <Link
                  href={`/edit/${qr.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] no-underline transition-colors hover:bg-[var(--surface)]"
                  onClick={() => setShowMenu(false)}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Duplicate
                </button>

                {/* Move to Folder submenu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
                  >
                    <span className="flex items-center gap-2">
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
                      Move to Folder
                    </span>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {showMoveMenu && (
                    <div className="absolute left-full top-0 ml-1 w-40 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg">
                      <button
                        onClick={() => {
                          onMoveToFolder(null);
                          setShowMenu(false);
                          setShowMoveMenu(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface)] ${
                          qr.folder_id === null
                            ? "bg-[var(--accent-light)] text-[var(--accent)]"
                            : "text-[var(--fg)]"
                        }`}
                      >
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
                          />
                        </svg>
                        Unorganized
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            onMoveToFolder(folder.id);
                            setShowMenu(false);
                            setShowMoveMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface)] ${
                            qr.folder_id === folder.id
                              ? "bg-[var(--accent-light)] text-[var(--accent)]"
                              : "text-[var(--fg)]"
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-sm"
                            style={{
                              backgroundColor: folder.color || "var(--accent)",
                            }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border)]" />

                <button
                  onClick={() => {
                    onDownload("png");
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
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
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    onDownload("svg");
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
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
                  Download SVG
                </button>

                <div className="border-t border-[var(--border)]" />

                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
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
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Header */}
      <div className="flex gap-4 p-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface)]">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
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
            {qr.qr_type === "static" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                📄 Static
              </span>
            )}
            {qr.qr_type === "dynamic" && (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  🔄 Dynamic
                </span>
                {qr.is_paid || qr.is_editable ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d1e7dd] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#198754]">
                    Paid ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3cd] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#856404]">
                    🔒 Locked
                  </span>
                )}
                {(qr.edit_count || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {qr.edit_count} {qr.edit_count === 1 ? "edit" : "edits"}
                  </span>
                )}
              </>
            )}
            {currentFolder && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${currentFolder.color}20`,
                  color: currentFolder.color || "var(--accent)",
                }}
              >
                {currentFolder.name}
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
            {qr.is_editable ? "Yes" : "No"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            Editable
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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
        <Link
          href={`/edit/${qr.id}`}
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
        <button
          onClick={() => onDownload("png")}
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
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2 py-2.5 text-xs font-medium text-[var(--fg)] transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-50"
        >
          {deleting ? (
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
  );
}
