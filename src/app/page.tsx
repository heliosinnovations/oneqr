import SimpleQRGenerator from "@/components/SimpleQRGenerator";
import ComparisonSection from "@/components/ComparisonSection";
import StatsSection from "@/components/StatsSection";
import TemplatesSection from "@/components/TemplatesSection";
import UseCasesSection from "@/components/UseCasesSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Link from "next/link";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 flex-shrink-0 text-emerald-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Navigation />

      <main id="main-content" className="min-h-screen bg-bg">
        {/* Hero Section - Split layout with content left, QR generator right */}
        <section
          className="bg-gradient-to-b from-accent-light to-bg px-6 pb-16 pt-24 lg:px-12 lg:pb-20 lg:pt-32"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left column - Content */}
            <div className="max-w-[560px]">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-3.5 w-3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                100% Free Forever
              </div>

              {/* Headline */}
              <h1
                id="hero-heading"
                className="mb-6 font-serif text-4xl leading-[1.1] tracking-tight text-fg md:text-5xl lg:text-[56px]"
              >
                The Ultimate{" "}
                <span className="italic text-accent">Free</span> QR Code
                Generator
              </h1>

              {/* Subheadline */}
              <p className="mb-8 max-w-[480px] text-lg text-muted lg:text-xl">
                Unlimited QR codes. Advanced customization. No watermarks. No
                subscriptions. Forever free.
              </p>

              {/* Feature highlights */}
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px]">Unlimited static QR codes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px]">10+ smart templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px]">High-res exports (4K)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px]">Bulk generation (50 codes)</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#qr-generator"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent to-[#e64500] px-6 py-4 font-semibold text-white shadow-lg shadow-accent/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/45"
                >
                  Create Free QR Code
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 font-semibold text-fg transition-colors hover:text-accent"
                >
                  Browse Templates
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right column - QR Generator */}
            <div
              id="qr-generator"
              className="mx-auto w-full max-w-[480px] scroll-mt-24 rounded-2xl bg-white p-6 shadow-xl shadow-black/10 lg:mx-0 lg:p-8"
            >
              <div className="mb-6 text-center">
                <h3 className="font-serif text-xl text-fg">
                  Instant QR Generator
                </h3>
                <p className="text-sm text-muted">No login required</p>
              </div>
              <SimpleQRGenerator />
            </div>
          </div>
        </section>

        {/* Comparison Section - Dark background with feature comparison */}
        <ComparisonSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Templates Section */}
        <TemplatesSection />

        {/* Use Cases Section */}
        <UseCasesSection />

        {/* Final CTA Section */}
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
