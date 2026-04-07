"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        closeMenu();
        buttonRef.current?.focus();
      }

      // Focus trap within menu
      if (e.key === "Tab" && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll(
          "a[href], button:not([disabled])"
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  // Focus first menu item when opened
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Small delay to ensure menu is rendered
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header>
      <nav
        className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif text-[28px] text-fg"
              aria-label="The QR Spot - Home"
            >
              The QR <span className="text-accent">Spot</span>
            </Link>
          </div>

          {/* Desktop Navigation Links - hidden on mobile */}
          <div className="hidden items-center gap-6 sm:flex">
            <Link
              href="/generator"
              className={`text-sm font-medium transition-colors hover:text-fg ${
                isActive("/generator") ? "text-fg" : "text-muted"
              }`}
            >
              Advanced Generator
            </Link>
            <Link
              href="/bulk"
              className={`text-sm font-medium transition-colors hover:text-fg ${
                isActive("/bulk") ? "text-fg" : "text-muted"
              }`}
            >
              Bulk Creation
            </Link>
            <UserMenu />
          </div>

          {/* Mobile Navigation - hamburger menu */}
          <div className="flex items-center gap-3 sm:hidden">
            <UserMenu />
            {/* Mobile hamburger button */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="flex h-10 w-10 items-center justify-center text-fg transition-colors hover:text-accent"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                // Close icon (X)
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`bg-fg/50 fixed inset-0 z-40 transition-opacity duration-300 sm:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`fixed bottom-0 right-0 top-0 z-50 w-72 bg-bg shadow-xl transition-transform duration-300 ease-in-out sm:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Menu header */}
        <div className="flex h-[72px] items-center justify-between border-b border-border px-6">
          <span className="font-serif text-lg text-fg">Menu</span>
          <button
            onClick={closeMenu}
            className="flex h-10 w-10 items-center justify-center text-fg transition-colors hover:text-accent"
            aria-label="Close navigation menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col p-6" aria-label="Mobile navigation">
          <Link
            ref={firstFocusableRef}
            href="/generator"
            className={`border-b border-border py-4 text-base font-medium transition-colors hover:text-accent ${
              isActive("/generator") ? "text-accent" : "text-fg"
            }`}
            onClick={closeMenu}
          >
            Advanced Generator
          </Link>
          <Link
            href="/bulk"
            className={`border-b border-border py-4 text-base font-medium transition-colors hover:text-accent ${
              isActive("/bulk") ? "text-accent" : "text-fg"
            }`}
            onClick={closeMenu}
          >
            Bulk Creation
          </Link>
          <Link
            href="/"
            className={`py-4 text-base font-medium transition-colors hover:text-accent ${
              isActive("/") && pathname === "/" ? "text-accent" : "text-fg"
            }`}
            onClick={closeMenu}
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
