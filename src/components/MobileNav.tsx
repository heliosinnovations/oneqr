"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface MobileNavProps {
  children?: React.ReactNode;
}

export default function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

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

  return (
    <>
      {/* Mobile hamburger button - visible only on mobile */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center text-fg transition-colors hover:text-accent sm:hidden"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
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
            className="border-b border-border py-4 text-base font-medium text-fg transition-colors hover:text-accent"
            onClick={closeMenu}
          >
            Advanced Generator
          </Link>
          <Link
            href="/bulk"
            className="border-b border-border py-4 text-base font-medium text-fg transition-colors hover:text-accent"
            onClick={closeMenu}
          >
            Bulk Creation
          </Link>
        </nav>

        {/* User menu slot (children from page) */}
        {children && (
          <div className="border-t border-border p-6">{children}</div>
        )}
      </div>
    </>
  );
}
