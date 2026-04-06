"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-serif text-2xl italic text-[var(--fg)] no-underline"
          >
            The QR <span className="text-[var(--accent)]">Spot</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/dashboard"
              className={`text-sm no-underline transition-colors ${
                pathname === "/dashboard"
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--accent)]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="text-sm text-[var(--muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              Create New
            </Link>
            <Link
              href="/bulk"
              className="text-sm text-[var(--muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              Bulk Create
            </Link>
            <Link
              href="/faq"
              className="text-sm text-[var(--muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              Help
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-[var(--fg)]">
                  {user?.email?.split("@")[0] || "User"}
                </div>
                <div className="text-xs text-[var(--muted)]">{user?.email}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-semibold text-[var(--accent)]">
                {user?.email ? getInitials(user.email) : "U"}
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg">
                  <div className="border-b border-[var(--border)] px-4 py-3 sm:hidden">
                    <p className="text-sm font-medium text-[var(--fg)]">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-[var(--fg)] no-underline transition-colors hover:bg-[var(--surface)]"
                    onClick={() => setShowDropdown(false)}
                  >
                    My QR Codes
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full border-t border-[var(--border)] px-4 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1200px] px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[var(--border)] py-8 text-center">
        <p className="text-xs text-[var(--muted)]">
          &copy; 2026 TheQRSpot. Simple, honest QR codes.
        </p>
      </footer>
    </div>
  );
}
