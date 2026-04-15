import Link from "next/link";

interface ComparisonRowProps {
  feature: string;
  theQRSpotValue: string;
  competitorValue: string;
  isTheQRSpotHighlighted?: boolean;
}

function CheckIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        className="h-3.5 w-3.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function XIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        className="h-3.5 w-3.5 opacity-40"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
}

function ComparisonRow({
  feature,
  theQRSpotValue,
  competitorValue,
  isTheQRSpotHighlighted = true,
}: ComparisonRowProps) {
  return (
    <tr>
      <td className="border-b border-white/5 px-4 py-4 text-sm font-medium text-white/80 md:px-6">
        {feature}
      </td>
      <td className="border-b border-white/5 bg-accent/5 px-4 py-4 md:px-6">
        <span className="flex items-center gap-2">
          {isTheQRSpotHighlighted && <CheckIcon />}
          <span className="text-sm font-semibold text-accent">
            {theQRSpotValue}
          </span>
        </span>
      </td>
      <td className="border-b border-white/5 px-4 py-4 md:px-6">
        <span className="flex items-center gap-2">
          <XIcon />
          <span className="text-sm text-white/40">{competitorValue}</span>
        </span>
      </td>
    </tr>
  );
}

export default function ComparisonSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-fg px-6 py-20 text-bg lg:px-12 lg:py-24"
      aria-labelledby="comparison-heading"
    >
      <div className="mx-auto max-w-[1000px]">
        {/* Section Header */}
        <header className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Why Choose The QR Spot?
          </p>
          <h2
            id="comparison-heading"
            className="font-serif text-3xl leading-tight tracking-tight md:text-4xl lg:text-[44px]"
          >
            More features. Zero cost.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60">
            See how we compare to paid alternatives. Spoiler: we&apos;re better
            and completely free.
          </p>
        </header>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl bg-white/[0.03]">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="border-b border-white/10 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.05em] text-white/50 md:px-6">
                  Feature
                </th>
                <th className="border-b border-white/10 bg-accent/10 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.05em] text-accent md:px-6">
                  The QR Spot
                </th>
                <th className="border-b border-white/10 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.05em] text-white/50 md:px-6">
                  Competitors
                </th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                feature="Price"
                theQRSpotValue="FREE"
                competitorValue="$5-15/month"
              />
              <ComparisonRow
                feature="QR Codes"
                theQRSpotValue="Unlimited"
                competitorValue="2-5 codes"
              />
              <ComparisonRow
                feature="Customization"
                theQRSpotValue="Advanced (colors, patterns, labels)"
                competitorValue="Basic / Locked"
              />
              <ComparisonRow
                feature="Smart Templates"
                theQRSpotValue="10+ templates"
                competitorValue="Few / None"
              />
              <ComparisonRow
                feature="Bulk Generation"
                theQRSpotValue="Up to 50 codes"
                competitorValue="Paid only"
              />
              <ComparisonRow
                feature="High-Res Export"
                theQRSpotValue="4K PNG, SVG, PDF"
                competitorValue="400px PNG"
              />
              <ComparisonRow
                feature="Watermarks"
                theQRSpotValue="None"
                competitorValue="Yes (free tier)"
              />
              <ComparisonRow
                feature="Save to Account"
                theQRSpotValue="Unlimited + Folders"
                competitorValue="Limited"
              />
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="#qr-generator"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 font-semibold text-white shadow-lg shadow-accent/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/50"
          >
            Start Creating for Free
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
        </div>
      </div>
    </section>
  );
}
