import type { Metadata } from "next";
import BulkQRCreator from "@/components/BulkQRCreator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bulk QR Code Generator | The QR Spot - Create Multiple QR Codes",
  description:
    "Generate hundreds of QR codes at once. Upload CSV or Excel, apply custom designs, and download as ZIP or multi-page PDF. Free bulk QR code generation.",
  keywords: [
    "bulk QR code generator",
    "batch QR codes",
    "multiple QR codes",
    "QR code CSV",
    "QR code Excel",
    "bulk download QR",
    "QR code PDF",
  ],
};

export default function BulkPage() {
  return (
    <>
      {/* Navigation */}
      <header>
        <nav
          className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg"
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

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/generator"
                className="text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                Advanced Generator
              </Link>
              <Link
                href="/bulk"
                className="text-sm font-semibold text-accent"
                aria-current="page"
              >
                Bulk Creation
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" className="min-h-screen bg-bg pt-[72px]">
        <BulkQRCreator />
      </main>
    </>
  );
}
