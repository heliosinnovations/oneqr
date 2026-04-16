"use client";

interface QRTypeSelectorProps {
  onSelect: (type: "static" | "dynamic") => void;
  selectedType?: "static" | "dynamic";
}

export default function QRTypeSelector({
  onSelect,
  selectedType,
}: QRTypeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Static QR Card */}
      <button
        onClick={() => onSelect("static")}
        className={`rounded-lg border-2 p-6 text-left transition ${
          selectedType === "static"
            ? "border-accent bg-accent-light"
            : "border-border hover:border-accent"
        }`}
      >
        <div className="mb-3 text-2xl">📄</div>
        <h3 className="mb-2 font-serif text-xl font-semibold">
          Static QR - Free
        </h3>
        <p className="mb-4 text-sm text-muted">
          Points directly to your URL. Cannot be changed after printing.
        </p>

        <div className="mb-3 text-sm font-medium">Best for:</div>
        <ul className="space-y-1 text-sm text-muted">
          <li>• Business cards</li>
          <li>• Flyers & posters</li>
          <li>• Temporary displays</li>
        </ul>
      </button>

      {/* Dynamic QR Card */}
      <button
        onClick={() => onSelect("dynamic")}
        className={`rounded-lg border-2 p-6 text-left transition ${
          selectedType === "dynamic"
            ? "border-accent bg-accent-light"
            : "border-border hover:border-accent"
        }`}
      >
        <div className="mb-3 text-2xl">🔄</div>
        <h3 className="mb-2 font-serif text-xl font-semibold">Dynamic QR</h3>
        <p className="mb-2 text-sm font-semibold text-accent">
          $1.99 one-time at first edit
        </p>
        <p className="mb-4 text-sm text-muted">
          Change destination anytime without reprinting.
        </p>

        <div className="mb-3 text-sm font-medium">Best for:</div>
        <ul className="space-y-1 text-sm text-muted">
          <li>• Billboards</li>
          <li>• Product packaging</li>
          <li>• Permanent installations</li>
        </ul>

        <p className="mt-4 text-xs italic text-muted">
          $1.99 vs $500+ to reprint & reinstall
        </p>
      </button>
    </div>
  );
}
