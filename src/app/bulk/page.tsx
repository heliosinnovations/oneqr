import type { Metadata } from "next";
import BulkQRCreator from "@/components/BulkQRCreator";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
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
      <Navigation />

      <main id="main-content" className="min-h-screen bg-bg pt-[72px]">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <nav
            className="flex items-center gap-2 pb-4 pt-6 text-sm"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-[var(--muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              Home
            </Link>
            <span className="text-[var(--muted)]" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-[var(--fg)]">Bulk Creation</span>
          </nav>
        </div>
        <BulkQRCreator />
      </main>

      <Footer />
    </>
  );
}
