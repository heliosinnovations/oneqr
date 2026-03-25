import Link from "next/link";

interface CompetitorData {
  name: string;
  pricing: string;
  pricingBadge?: "free" | "paid" | "limited";
  expiration: string;
  maxResolution: string;
  exportFormats: string;
  scanLimits: string;
  designOptions: string;
  designIcon?: "check" | "partial";
  isHighlighted?: boolean;
}

const competitors: CompetitorData[] = [
  {
    name: "The QR Spot",
    pricing: "Free Forever",
    pricingBadge: "free",
    expiration: "Never expires",
    maxResolution: "4K / 600 DPI",
    exportFormats: "PNG, SVG, PDF, EPS",
    scanLimits: "Unlimited",
    designOptions: "6 patterns, 9 styles",
    designIcon: "check",
    isHighlighted: true,
  },
  {
    name: "Others",
    pricing: "$5-15/month",
    expiration: "Expires with plan",
    maxResolution: "1024px - 2000px",
    exportFormats: "PNG, SVG",
    scanLimits: "Limited",
    designOptions: "Limited",
    designIcon: "partial",
  },
  {
    name: "Others",
    pricing: "$8-20/month",
    expiration: "Expires with plan",
    maxResolution: "1024px - 2000px",
    exportFormats: "PNG, SVG, PDF",
    scanLimits: "10,000/month",
    designOptions: "Basic",
    designIcon: "partial",
  },
];

const features = [
  "Pricing",
  "QR Code Expiration",
  "Max Resolution",
  "Export Formats",
  "Scan Limits",
  "Advanced Design Options",
] as const;

function PricingBadge({ type }: { type: "free" | "paid" | "limited" }) {
  const baseClasses =
    "inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide";

  switch (type) {
    case "free":
      return (
        <span className={`${baseClasses} bg-emerald-500 text-white`}>
          Free Forever
        </span>
      );
    case "paid":
      return (
        <span className={`${baseClasses} bg-red-500 text-white`}>Paid</span>
      );
    case "limited":
      return (
        <span className={`${baseClasses} bg-amber-500 text-white`}>
          Limited
        </span>
      );
  }
}

function CheckIcon() {
  return (
    <span className="text-lg font-bold text-emerald-500" aria-label="Yes">
      &#10003;
    </span>
  );
}

function PartialIcon() {
  return (
    <span className="text-sm font-bold text-amber-500" aria-label="Limited">
      Limited
    </span>
  );
}

export default function ComparisonSection() {
  return (
    <section
      className="scroll-mt-20 bg-bg px-6 py-20 lg:px-12 lg:py-28"
      aria-labelledby="comparison-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <header className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Compare &amp; Save
          </p>
          <h2
            id="comparison-heading"
            className="font-serif text-[clamp(32px,5vw,48px)] leading-[1.15] tracking-tight text-fg"
          >
            Why choose <em className="italic text-accent">The QR Spot</em>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            Professional features without professional pricing. See how we
            compare to the competition.
          </p>
        </header>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto rounded border-2 border-fg md:block">
          <table className="w-full min-w-[640px] border-collapse bg-bg">
            <thead>
              <tr>
                <th className="border-b border-r border-border bg-surface px-5 py-4 text-left font-serif text-lg font-normal">
                  Feature
                </th>
                {competitors.map((competitor, index) => (
                  <th
                    key={`header-${index}`}
                    className={`border-b border-border px-5 py-4 text-left font-serif text-lg font-normal ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-t-[3px] border-accent bg-accent text-white"
                        : "bg-surface"
                    } ${index === 0 ? "" : ""}`}
                  >
                    {competitor.isHighlighted ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-white" />
                        {competitor.name}
                      </span>
                    ) : (
                      competitor.name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Pricing Row */}
              <tr>
                <td className="border-b border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  Pricing
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`pricing-${index}`}
                    className={`border-b border-border px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    {competitor.pricingBadge ? (
                      <PricingBadge type={competitor.pricingBadge} />
                    ) : (
                      <span className="text-sm text-muted">
                        {competitor.pricing}
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Expiration Row */}
              <tr>
                <td className="border-b border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  QR Code Expiration
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`expiration-${index}`}
                    className={`border-b border-border px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${competitor.isHighlighted ? "font-semibold text-fg" : "text-muted"}`}
                    >
                      {competitor.expiration}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Max Resolution Row */}
              <tr>
                <td className="border-b border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  Max Resolution
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`resolution-${index}`}
                    className={`border-b border-border px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${competitor.isHighlighted ? "font-semibold text-fg" : "text-muted"}`}
                    >
                      {competitor.maxResolution}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Export Formats Row */}
              <tr>
                <td className="border-b border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  Export Formats
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`formats-${index}`}
                    className={`border-b border-border px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${competitor.isHighlighted ? "font-semibold text-fg" : "text-muted"}`}
                    >
                      {competitor.exportFormats}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Scan Limits Row */}
              <tr>
                <td className="border-b border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  Scan Limits
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`scans-${index}`}
                    className={`border-b border-border px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${competitor.isHighlighted ? "font-semibold text-fg" : "text-muted"}`}
                    >
                      {competitor.scanLimits}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Design Options Row (Last) */}
              <tr>
                <td className="border-r border-border bg-surface px-5 py-4 text-sm font-medium text-fg">
                  Advanced Design Options
                </td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`design-${index}`}
                    className={`px-5 py-4 ${
                      competitor.isHighlighted
                        ? "border-b-[3px] border-l-[3px] border-r-[3px] border-accent bg-accent-light"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {competitor.designIcon === "check" && <CheckIcon />}
                      {competitor.designIcon === "partial" && <PartialIcon />}
                      {competitor.isHighlighted && (
                        <span className="text-sm font-semibold text-fg">
                          {competitor.designOptions}
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 md:hidden">
          {competitors.map((competitor, index) => (
            <div
              key={`card-${index}`}
              className={`rounded-lg border-2 p-6 ${
                competitor.isHighlighted
                  ? "border-accent bg-accent-light"
                  : "border-border bg-bg"
              }`}
            >
              <h3
                className={`mb-4 flex items-center gap-2 font-serif text-xl ${
                  competitor.isHighlighted ? "text-accent" : "text-fg"
                }`}
              >
                {competitor.isHighlighted && (
                  <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                )}
                {competitor.name}
              </h3>

              <div className="space-y-0">
                <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                  <span className="text-muted">Pricing</span>
                  <span className="text-right font-medium">
                    {competitor.pricingBadge ? (
                      <PricingBadge type={competitor.pricingBadge} />
                    ) : (
                      competitor.pricing
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                  <span className="text-muted">Expiration</span>
                  <span
                    className={`text-right font-medium ${competitor.isHighlighted ? "text-fg" : ""}`}
                  >
                    {competitor.expiration}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                  <span className="text-muted">Max Resolution</span>
                  <span
                    className={`text-right font-medium ${competitor.isHighlighted ? "text-fg" : ""}`}
                  >
                    {competitor.maxResolution}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                  <span className="text-muted">Export Formats</span>
                  <span
                    className={`text-right font-medium ${competitor.isHighlighted ? "text-fg" : ""}`}
                  >
                    {competitor.exportFormats}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                  <span className="text-muted">Scan Limits</span>
                  <span
                    className={`text-right font-medium ${competitor.isHighlighted ? "text-fg" : ""}`}
                  >
                    {competitor.scanLimits}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-muted">Design Options</span>
                  <span
                    className={`text-right font-medium ${competitor.isHighlighted ? "text-fg" : ""}`}
                  >
                    {competitor.designOptions}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-[13px] text-muted">
          * Comparison based on typical QR code generator pricing and features
          as of March 2026.
        </p>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/generator"
            className="inline-flex items-center gap-2.5 bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-fg"
          >
            Try It Free
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
