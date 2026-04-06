import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-[#fffef9] text-[#1a1a1a]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-8 font-serif text-5xl italic">Privacy Policy</h1>
          <p className="mb-12 text-sm text-gray-600">
            Last Updated: March 23, 2026
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Who We Are</h2>
              <p>
                The QR Spot is a QR code generator service operated by Helios
                Innovations. Our website address is:{" "}
                <a
                  href="https://theqrspot.com"
                  className="text-[#ff4d00] hover:underline"
                >
                  https://theqrspot.com
                </a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">What Data We Collect</h2>

              <h3 className="mb-3 mt-6 text-2xl font-semibold">
                Information You Provide
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Email Address:</strong> When you save QR codes to your
                  dashboard, we collect your email address for magic link
                  authentication
                </li>
                <li>
                  <strong>URLs:</strong> The destination URLs you input to
                  generate QR codes
                </li>
                <li>
                  <strong>QR Code Metadata:</strong> Creation date, edit
                  history, and scan analytics for your saved QR codes
                </li>
              </ul>

              <h3 className="mb-3 mt-6 text-2xl font-semibold">
                Information We Collect Automatically
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Analytics Data:</strong> We use cookies and similar
                  technologies to collect:
                  <ul className="list-circle mt-2 pl-6">
                    <li>Pages visited</li>
                    <li>Time spent on site</li>
                    <li>Browser type and version</li>
                    <li>Device type (desktop, mobile, tablet)</li>
                    <li>Geographic location (country/city level)</li>
                    <li>Referral source (how you found us)</li>
                  </ul>
                </li>
                <li>
                  <strong>Scan Analytics:</strong> When someone scans your QR
                  code, we collect:
                  <ul className="list-circle mt-2 pl-6">
                    <li>Scan timestamp</li>
                    <li>Geographic location (country/city level)</li>
                    <li>Device type</li>
                    <li>Browser type</li>
                  </ul>
                </li>
              </ul>

              <h3 className="mb-3 mt-6 text-2xl font-semibold">
                Advertising Data
              </h3>
              <p>
                We use Google AdSense to display advertisements on our website.
                Google may collect:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>Cookies and advertising identifiers</li>
                <li>IP address</li>
                <li>Browsing behavior across sites</li>
                <li>
                  For more information:{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff4d00] hover:underline"
                  >
                    Google Privacy Policy
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">How We Use Your Data</h2>
              <p>We use the collected data to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Generate and store your QR codes</li>
                <li>Send you magic link emails for dashboard access</li>
                <li>Provide scan analytics for your QR codes</li>
                <li>Improve our service and user experience</li>
                <li>Display relevant advertisements (via Google AdSense)</li>
                <li>Prevent fraud and abuse</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">
                How We Store Your Data
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Data Storage:</strong> Your data is stored on secure
                  servers provided by Supabase (hosted on AWS)
                </li>
                <li>
                  <strong>Encryption:</strong> All data is encrypted in transit
                  (HTTPS) and at rest
                </li>
                <li>
                  <strong>Retention:</strong> We retain your QR codes and
                  analytics data as long as your account is active
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your
                  data at any time by contacting us
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Your Data Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Access:</strong> Request a copy of your data
                </li>
                <li>
                  <strong>Rectification:</strong> Correct inaccurate data
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your data
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in a
                  machine-readable format
                </li>
                <li>
                  <strong>Object:</strong> Opt out of certain data processing
                  activities
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at:{" "}
                <a
                  href="mailto:info@heliosinnovations.org"
                  className="text-[#ff4d00] hover:underline"
                >
                  info@heliosinnovations.org
                </a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Supabase:</strong> Database and authentication
                </li>
                <li>
                  <strong>Vercel:</strong> Hosting and deployment
                </li>
                <li>
                  <strong>Google AdSense:</strong> Advertising
                </li>
                <li>
                  <strong>Google Analytics:</strong> Website analytics
                  (optional)
                </li>
              </ul>
              <p className="mt-4">
                Each service has its own privacy policy governing how they
                handle your data.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Cookies</h2>
              <p>We use cookies for:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Authentication:</strong> Keeping you logged in
                </li>
                <li>
                  <strong>Analytics:</strong> Understanding how you use our
                  service
                </li>
                <li>
                  <strong>Advertising:</strong> Showing relevant ads via Google
                  AdSense
                </li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling
                cookies may affect site functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Do Not Track</h2>
              <p>
                We honor Do Not Track (DNT) signals. When DNT is enabled, we
                disable analytics tracking.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Children's Privacy</h2>
              <p>
                The QR Spot is not intended for users under 13. We do not
                knowingly collect data from children.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">International Users</h2>
              <p>
                Your data may be transferred to and processed in the United
                States or other countries where our service providers operate.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">
                Changes to This Policy
              </h2>
              <p>
                We may update this policy from time to time. Changes will be
                posted on this page with an updated "Last Updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-3xl">Contact Us</h2>
              <p>For privacy-related questions or requests:</p>
              <ul className="list-disc space-y-2 pl-6">
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
            </section>

            <p className="mt-12 border-t pt-6 text-sm italic text-gray-600">
              This privacy policy complies with GDPR, CCPA, and Google AdSense
              requirements.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
