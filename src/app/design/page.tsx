"use client";

import { useState } from "react";
import Link from "next/link";
import AdvancedDesignCustomization from "@/components/AdvancedDesignCustomization";

export default function DesignPage() {
  const [url, setUrl] = useState("https://theqrspot.com");

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <header>
        <nav
          className="fixed left-0 right-0 top-0 z-[60] border-b border-border bg-bg"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
            {/* Logo */}
            <Link
              href="/"
              className="font-serif text-[28px] italic text-fg"
              aria-label="The QR Spot - Home"
            >
              The QR <span className="text-accent">Spot</span>
            </Link>

            {/* URL Input */}
            <div className="mx-8 hidden max-w-md flex-1 md:flex">
              <div className="relative w-full">
                <label htmlFor="qr-url-input" className="sr-only">
                  Enter URL for QR code
                </label>
                <input
                  id="qr-url-input"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="w-full border border-border bg-white px-4 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
                />
              </div>
            </div>

            {/* Back to Home */}
            <Link
              href="/"
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              Back to Home
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="min-h-screen bg-bg pt-[72px]">
        {/* Mobile URL Input */}
        <div className="border-b border-border bg-white p-4 md:hidden">
          <label htmlFor="qr-url-input-mobile" className="sr-only">
            Enter URL for QR code
          </label>
          <input
            id="qr-url-input-mobile"
            type="url"
            inputMode="url"
            autoComplete="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="w-full border border-border bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>

        <AdvancedDesignCustomization url={url} />
      </main>
    </>
  );
}
