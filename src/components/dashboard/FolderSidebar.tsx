"use client";

import { useState } from "react";

export interface Folder {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  qrCountByFolder: Record<string, number>;
  unorganizedCount: number;
  totalCount: number;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  qrCountByFolder,
  unorganizedCount,
  totalCount,
}: FolderSidebarProps) {
  const [contextMenu, setContextMenu] = useState<{
    folderId: string;
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    setContextMenu({
      folderId: folder.id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Organize
        </h2>
        <button
          onClick={onCreateFolder}
          className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)]"
          title="Create folder"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* All QR Codes */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
          selectedFolderId === null
            ? "bg-[var(--accent-light)] text-[var(--accent)]"
            : "text-[var(--fg)] hover:bg-[var(--surface)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-4 w-4"
          >
            <rect x="3" y="3" width="7" height="7" strokeWidth={1.5} />
            <rect x="14" y="3" width="7" height="7" strokeWidth={1.5} />
            <rect x="3" y="14" width="7" height="7" strokeWidth={1.5} />
            <rect x="14" y="14" width="4" height="4" strokeWidth={1.5} />
          </svg>
          All QR Codes
        </span>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
          {totalCount}
        </span>
      </button>

      {/* Divider */}
      <div className="my-3 border-t border-[var(--border)]" />

      {/* Folders Section */}
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Folders
      </div>

      {/* Folder List */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            onContextMenu={(e) => handleContextMenu(e, folder)}
            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              selectedFolderId === folder.id
                ? "bg-[var(--accent-light)] text-[var(--accent)]"
                : "text-[var(--fg)] hover:bg-[var(--surface)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: folder.color || "var(--accent)",
                }}
              />
              <span className="truncate">{folder.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                {qrCountByFolder[folder.id] || 0}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, folder);
                }}
                className="opacity-0 transition-opacity group-hover:opacity-100"
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </span>
          </button>
        ))}

        {/* Unorganized */}
        <button
          onClick={() => onSelectFolder("unorganized")}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
            selectedFolderId === "unorganized"
              ? "bg-[var(--accent-light)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
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
                strokeWidth={1.5}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
              />
            </svg>
            Unorganized
          </span>
          <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
            {unorganizedCount}
          </span>
        </button>
      </div>

      {/* Create Folder Button */}
      <button
        onClick={onCreateFolder}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Folder
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
          <div
            className="fixed z-50 w-40 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={() => {
                const folder = folders.find(
                  (f) => f.id === contextMenu.folderId
                );
                if (folder) onEditFolder(folder);
                closeContextMenu();
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Rename
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Delete this folder? QR codes will be moved to Unorganized."
                  )
                ) {
                  onDeleteFolder(contextMenu.folderId);
                }
                closeContextMenu();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
