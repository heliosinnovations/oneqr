export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffef9] text-[#1a1a1a]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-8 font-serif text-5xl italic">Terms of Service</h1>
        <p className="mb-12 text-sm text-gray-600">
          Last Updated: March 23, 2026
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Agreement to Terms</h2>
            <p>
              By accessing or using The QR Spot (
              <a
                href="https://theqrspot.com"
                className="text-[#ff4d00] hover:underline"
              >
                https://theqrspot.com
              </a>
              ), operated by Helios Innovations, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Description of Service</h2>
            <p>
              The QR Spot is a QR code generator service that allows you to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Generate QR codes for free with no limits</li>
              <li>Save QR codes to your dashboard with a free account</li>
              <li>Edit and manage your saved QR codes</li>
              <li>View scan analytics for your QR codes</li>
              <li>Create bulk QR codes for business use</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">User Accounts</h2>
            <h3 className="mb-3 mt-6 text-2xl font-semibold">
              Account Creation
            </h3>
            <p>
              To save QR codes to your dashboard, you must create an account by
              providing a valid email address. We use magic link authentication
              — no passwords are required.
            </p>

            <h3 className="mb-3 mt-6 text-2xl font-semibold">
              Account Responsibilities
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>You are responsible for maintaining access to your email</li>
              <li>You must not share account access with others</li>
              <li>
                You must notify us immediately of any unauthorized account use
              </li>
              <li>You must be at least 13 years old to create an account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Acceptable Use</h2>
            <p>When using The QR Spot, you agree NOT to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Create QR codes that link to illegal, harmful, or malicious
                content
              </li>
              <li>
                Use the service for phishing, fraud, or deceptive practices
              </li>
              <li>
                Create QR codes that distribute malware, viruses, or harmful
                software
              </li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>
                Attempt to disrupt, hack, or compromise our service or
                infrastructure
              </li>
              <li>
                Use automated tools to generate excessive numbers of QR codes
              </li>
              <li>
                Impersonate others or create QR codes on behalf of others
                without permission
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Intellectual Property</h2>
            <h3 className="mb-3 mt-6 text-2xl font-semibold">Our Content</h3>
            <p>
              The QR Spot website, branding, design, and underlying technology
              are owned by Helios Innovations and protected by copyright and
              other intellectual property laws.
            </p>

            <h3 className="mb-3 mt-6 text-2xl font-semibold">Your Content</h3>
            <p>
              You retain ownership of the URLs and content you link to via your
              QR codes. By using our service, you grant us a limited license to
              process and store this information solely to provide the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Service Availability</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                We strive to maintain 99.9% uptime but do not guarantee
                uninterrupted service
              </li>
              <li>
                We may perform maintenance that temporarily affects availability
              </li>
              <li>
                We are not liable for any losses due to service interruptions
              </li>
              <li>
                QR codes you generate are permanent — they do not expire or stop
                working
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Payment Terms</h2>
            <p>The QR Spot offers both free and paid features:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Free tier:</strong> Generate unlimited QR codes, save to
                dashboard
              </li>
              <li>
                <strong>Paid features:</strong> One-time payment for editing and
                advanced features
              </li>
              <li>All payments are processed securely via Stripe</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">
              Disclaimer of Warranties
            </h2>
            <p>
              The QR Spot is provided "as is" and "as available" without
              warranties of any kind, either express or implied, including but
              not limited to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or reliability of any content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Helios Innovations shall
              not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Loss of profits or revenue</li>
              <li>Loss of data</li>
              <li>Loss of business opportunities</li>
              <li>Service interruptions</li>
            </ul>
            <p className="mt-4">
              Our total liability for any claim shall not exceed the amount you
              paid us in the past 12 months, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Helios Innovations from
              any claims, damages, or expenses (including legal fees) arising
              from:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Your use of the service</li>
              <li>Your violation of these terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you link to via QR codes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any
              time for:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Violation of these Terms of Service</li>
              <li>Illegal or fraudulent activity</li>
              <li>Creating harmful or malicious QR codes</li>
              <li>Abuse of the service</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the service ceases
              immediately. QR codes you have already generated will continue to
              function.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the United States. Any disputes arising from these
              terms shall be resolved in the courts of the United States.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Changes
              will be posted on this page with an updated "Last Updated" date.
              Continued use of the service after changes constitutes acceptance
              of the new terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 font-serif text-3xl">Contact Us</h2>
            <p>For questions about these Terms of Service:</p>
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
            By using The QR Spot, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </main>
  );
}
