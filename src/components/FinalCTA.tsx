import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-b from-bg to-accent-light px-6 py-20 text-center lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[700px]">
        <h2 className="mb-4 font-serif text-3xl tracking-tight text-fg md:text-4xl lg:text-[40px]">
          Ready to create your free QR code?
        </h2>
        <p className="mb-8 text-lg text-muted">
          Join 50,000+ users who trust The QR Spot for their QR code needs. No
          credit card. No catches. Just free.
        </p>
        <Link
          href="#qr-generator"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent to-[#e64500] px-8 py-4 font-semibold text-white shadow-lg shadow-accent/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/45"
        >
          Create Free QR Code Now
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
    </section>
  );
}
