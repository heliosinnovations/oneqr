export default function StatsSection() {
  return (
    <section className="bg-surface px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-[1000px] gap-8 text-center md:grid-cols-3">
        <div className="p-4 md:p-8">
          <div className="font-serif text-4xl text-accent md:text-5xl">
            50,000+
          </div>
          <div className="mt-2 text-sm text-muted md:text-base">
            Happy users creating QR codes
          </div>
        </div>
        <div className="p-4 md:p-8">
          <div className="font-serif text-4xl text-accent md:text-5xl">
            500,000+
          </div>
          <div className="mt-2 text-sm text-muted md:text-base">
            QR codes generated
          </div>
        </div>
        <div className="p-4 md:p-8">
          <div className="font-serif text-4xl text-accent md:text-5xl">
            100%
          </div>
          <div className="mt-2 text-sm text-muted md:text-base">
            Free, forever
          </div>
        </div>
      </div>
    </section>
  );
}
