import Footer from "@/components/Footer";

export default function FAQPage() {
  return (
    <>
      <main className="min-h-screen bg-[#fffef9] text-[#1a1a1a]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-12 font-serif text-5xl italic">
            Frequently Asked Questions
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                General Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    What is The QR Spot?
                  </h3>
                  <p className="text-gray-700">
                    The QR Spot is a completely free QR code generator that lets
                    you create unlimited QR codes, customize them, edit them,
                    and download them. Unlike other services, your QR codes
                    never expire and there are no hidden limits.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    How much does it cost?
                  </h3>
                  <p className="text-gray-700">
                    <strong>100% Free!</strong> Generate unlimited QR codes,
                    download as PNG/SVG, print immediately, edit anytime, and
                    view analytics—all completely free.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    What does &quot;editable&quot; mean?
                  </h3>
                  <p className="text-gray-700">
                    You can change where a QR code points without reprinting it.
                    For example, if you printed QR codes on business cards, you
                    can update the destination URL to point to a new website,
                    portfolio, or offer—without reprinting the cards.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do my QR codes expire?
                  </h3>
                  <p className="text-gray-700">
                    Never. Once you generate a QR code, it works forever.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Technical Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    What formats can I download QR codes in?
                  </h3>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>
                      <strong>PNG:</strong> For printing, social media,
                      presentations
                    </li>
                    <li>
                      <strong>SVG:</strong> Vector format for scaling to any
                      size without quality loss
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    What can I put in a QR code?
                  </h3>
                  <p className="mb-2 text-gray-700">Any URL:</p>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Website links</li>
                    <li>Social media profiles</li>
                    <li>Google Maps locations</li>
                    <li>Wi-Fi network credentials</li>
                    <li>YouTube videos</li>
                    <li>PDFs or documents</li>
                    <li>Online menus</li>
                    <li>Contact information (vCard)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    How big should I print QR codes?
                  </h3>
                  <p className="text-gray-700">
                    Minimum recommended size: <strong>2cm × 2cm</strong> (0.8in
                    × 0.8in). Larger is better for scanning from a distance.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Will my QR codes work everywhere?
                  </h3>
                  <p className="text-gray-700">
                    Yes! QR codes are a universal standard supported by all
                    modern smartphones (iPhone, Android) without needing an app.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Account & Dashboard
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do I need an account to generate QR codes?
                  </h3>
                  <p className="text-gray-700">
                    No. You can generate and download QR codes instantly without
                    signing up.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Why would I create an account?
                  </h3>
                  <p className="mb-2 text-gray-700">An account lets you:</p>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Save QR codes to your dashboard</li>
                    <li>Edit destination URLs after printing</li>
                    <li>View scan analytics</li>
                    <li>Access your QR codes from any device</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    How do I log in?
                  </h3>
                  <p className="text-gray-700">
                    We use magic links—no passwords needed. Enter your email,
                    click the link we send you, and you&apos;re in.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Can I delete my account?
                  </h3>
                  <p className="text-gray-700">
                    Yes. Contact us at info@heliosinnovations.org and we&apos;ll
                    delete all your data within 7 days.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Editing & Analytics
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    How do editable QR codes work?
                  </h3>
                  <p className="text-gray-700">
                    When you save a QR code to your dashboard, it redirects
                    through our service (e.g., <code>theqrspot.com/abc123</code>
                    ). You can change the destination URL in your dashboard, and
                    the QR code automatically updates.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do you track who scans my QR codes?
                  </h3>
                  <p className="mb-2 text-gray-700">
                    For QR codes saved to your dashboard, we collect basic scan
                    analytics:
                  </p>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Number of scans</li>
                    <li>Scan date/time</li>
                    <li>Country/city location</li>
                    <li>Device type (iPhone, Android, etc.)</li>
                  </ul>
                  <p className="mt-2 text-gray-700">
                    We don&apos;t collect personal information about scanners.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Can I disable analytics?
                  </h3>
                  <p className="text-gray-700">
                    Yes. In your dashboard, turn off analytics for any QR code.
                    Scans will still work, but won&apos;t be tracked.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Printing & Usage
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    How do I print QR codes?
                  </h3>
                  <ol className="list-decimal space-y-1 pl-6 text-gray-700">
                    <li>
                      Download as PNG (for normal printing) or SVG (for
                      professional printing)
                    </li>
                    <li>Open in any image viewer or design tool</li>
                    <li>Print at a minimum size of 2cm × 2cm</li>
                  </ol>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Can I use QR codes commercially?
                  </h3>
                  <p className="text-gray-700">
                    Absolutely! Use them on business cards, flyers, product
                    packaging, signage, menus—anywhere you want.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Can I customize the QR code design?
                  </h3>
                  <p className="text-gray-700">
                    Yes! You can customize colors, patterns, and more using our
                    generator.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do I own the QR codes I create?
                  </h3>
                  <p className="text-gray-700">
                    Yes. You own full commercial rights to any QR code you
                    generate.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Privacy & Security
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do you sell my data?
                  </h3>
                  <p className="text-gray-700">
                    Never. We only use your data to provide the service. Read
                    our{" "}
                    <a
                      href="/privacy"
                      className="text-[#ff4d00] hover:underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    for details.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Is my data secure?
                  </h3>
                  <p className="text-gray-700">
                    Yes. All data is encrypted in transit (HTTPS) and at rest.
                    We use industry-standard security practices.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Do you show ads?
                  </h3>
                  <p className="text-gray-700">
                    Yes, we display subtle ads to cover hosting costs.
                    They&apos;re non-intrusive and placed at the top and bottom
                    of the homepage.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b pb-2 font-serif text-3xl">
                Troubleshooting
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    My QR code isn&apos;t scanning. What&apos;s wrong?
                  </h3>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>
                      <strong>Check size:</strong> Print at least 2cm × 2cm
                    </li>
                    <li>
                      <strong>Check contrast:</strong> Use black QR on white
                      background
                    </li>
                    <li>
                      <strong>Check damage:</strong> Make sure it&apos;s not
                      smudged or torn
                    </li>
                    <li>
                      <strong>Try different apps:</strong> Some camera apps work
                      better than others
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    The QR code redirects to the wrong URL.
                  </h3>
                  <p className="text-gray-700">
                    Check your dashboard to see what URL it&apos;s set to and
                    update it if needed.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    I didn&apos;t receive my magic link email.
                  </h3>
                  <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you typed your email correctly</li>
                    <li>Wait a few minutes (sometimes emails are delayed)</li>
                    <li>Contact us if it still doesn&apos;t arrive</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mt-12 border-t pt-8">
              <h2 className="mb-4 font-serif text-3xl">
                Still Have Questions?
              </h2>
              <p className="mb-2 text-gray-700">Contact us at:</p>
              <ul className="list-disc space-y-1 pl-6 text-gray-700">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:info@heliosinnovations.org"
                    className="text-[#ff4d00] hover:underline"
                  >
                    info@heliosinnovations.org
                  </a>
                </li>
                <li>
                  Website:{" "}
                  <a
                    href="https://theqrspot.com"
                    className="text-[#ff4d00] hover:underline"
                  >
                    https://theqrspot.com
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                We typically respond within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
