"use client";

import { useState } from "react";
import { Folder } from "./FolderSidebar";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  folders: Folder[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  onDelete: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  isDeleting: boolean;
}

export default function BulkActionsBar({
  selectedCount,
  totalCount,
  folders,
  onSelectAll,
  onDeselectAll,
  onMoveToFolder,
  onDelete,
  onDownloadZip,
  isDownloading,
  isDeleting,
}: BulkActionsBarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="animate-slideIn fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-lg">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
            {selectedCount}
          </span>
          <span className="text-sm text-[var(--fg)]">selected</span>
        </div>

        <div className="h-6 border-l border-[var(--border)]" />

        {/* Select All / Deselect */}
        {selectedCount < totalCount ? (
          <button
            onClick={onSelectAll}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-light)]"
          >
            Select All ({totalCount})
          </button>
        ) : (
          <button
            onClick={onDeselectAll}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)]"
          >
            Deselect All
          </button>
        )}

        <div className="h-6 border-l border-[var(--border)]" />

        {/* Move to Folder */}
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
            Move to Folder
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showMoveMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMoveMenu(false)}
              />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg">
                <button
                  onClick={() => {
                    onMoveToFolder(null);
                    setShowMoveMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-[var(--muted)]"
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
                {folders.length > 0 && (
                  <div className="border-t border-[var(--border)]" />
                )}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMoveToFolder(folder.id);
                      setShowMoveMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
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
            </>
          )}
        </div>

        {/* Download ZIP */}
        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
              Downloading...
            </>
          ) : (
            <>
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
              Download ZIP
            </>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
              Deleting...
            </>
          ) : (
            <>
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
              Delete
            </>
          )}
        </button>

        {/* Close */}
        <button
          onClick={onDeselectAll}
          className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
          title="Clear selection"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
