"use client";

import { useState, useEffect } from "react";
import { Folder } from "./FolderSidebar";

const PRESET_COLORS = [
  "#ff4d00", // Orange (accent)
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ef4444", // Red
  "#84cc16", // Lime
  "#6366f1", // Indigo
];

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
  editingFolder?: Folder | null;
}

export default function FolderModal({
  isOpen,
  onClose,
  onSave,
  editingFolder,
}: FolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setColor(editingFolder.color || PRESET_COLORS[0]);
    } else {
      setName("");
      setColor(PRESET_COLORS[0]);
    }
    setError(null);
  }, [editingFolder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }

    if (name.trim().length > 50) {
      setError("Folder name must be 50 characters or less");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(name.trim(), color);
      onClose();
    } catch {
      setError("Failed to save folder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-[var(--fg)]">
            {editingFolder ? "Edit Folder" : "New Folder"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
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

        <form onSubmit={handleSubmit}>
          {/* Folder Name */}
          <div className="mb-6">
            <label
              htmlFor="folder-name"
              className="mb-2 block text-sm font-medium text-[var(--fg)]"
            >
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Marketing"
              className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[var(--fg)]">
              Folder Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`h-8 w-8 rounded-lg transition-transform hover:scale-110 ${
                    color === presetColor
                      ? "ring-2 ring-[var(--fg)] ring-offset-2"
                      : ""
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 rounded-lg bg-[var(--surface)] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Preview
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium text-[var(--fg)]">
                {name || "Folder Name"}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e64500] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingFolder
                  ? "Update Folder"
                  : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
