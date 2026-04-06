import Link from "next/link";
import Footer from "@/components/Footer";

export default function AuthErrorPage() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-4xl italic text-fg">
            Authentication Error
          </h1>
          <p className="mb-8 text-muted">
            We couldn&apos;t sign you in. The magic link may have expired or
            been used already.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-fg"
          >
            Return Home
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
