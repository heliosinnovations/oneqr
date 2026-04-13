"use client";

export type DateFilter = "all" | "this_week" | "this_month" | "older";
export type SortOption = "newest" | "oldest" | "most_scanned" | "a_z";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  sortOption,
  onSortChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 sm:max-w-sm">
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
          placeholder="Search by title or URL..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
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
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All Time</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="older">Older</option>
        </select>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_scanned">Most Scanned</option>
          <option value="a_z">A-Z</option>
        </select>
      </div>
    </div>
  );
}
