"use client";

import { useMemo } from "react";

interface PrintPreviewProps {
  headerContent: string;
  footerContent: string;
  qrDataUrl: string | null;
  qrLabel?: string;
}

export default function PrintPreview({
  headerContent,
  footerContent,
  qrDataUrl,
  qrLabel = "Scan Me",
}: PrintPreviewProps) {
  const isHeaderEmpty = useMemo(() => {
    const stripped = headerContent.replace(/<[^>]*>/g, "").trim();
    return stripped.length === 0;
  }, [headerContent]);

  const isFooterEmpty = useMemo(() => {
    const stripped = footerContent.replace(/<[^>]*>/g, "").trim();
    return stripped.length === 0;
  }, [footerContent]);

  return (
    <div className="paper" id="print-area">
      {isHeaderEmpty ? (
        <div className="paper-header empty">Add a header</div>
      ) : (
        <div
          className="paper-header"
          dangerouslySetInnerHTML={{ __html: headerContent }}
        />
      )}

      <div className="paper-qr">
        <div className="qr-wrapper">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="qr-image"
              width={150}
              height={150}
            />
          ) : (
            <div className="qr-placeholder">
              <svg viewBox="0 0 24 24" className="qr-icon">
                <rect x="3" y="3" width="7" height="7" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" fill="currentColor" />
                <rect x="3" y="14" width="7" height="7" fill="currentColor" />
                <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                <rect x="18" y="14" width="3" height="3" fill="currentColor" />
                <rect x="14" y="18" width="3" height="3" fill="currentColor" />
                <rect x="18" y="18" width="3" height="3" fill="currentColor" />
              </svg>
            </div>
          )}
          <span className="qr-label">{qrLabel}</span>
        </div>
      </div>

      {isFooterEmpty ? (
        <div className="paper-footer empty">Add instructions</div>
      ) : (
        <div
          className="paper-footer"
          dangerouslySetInnerHTML={{ __html: footerContent }}
        />
      )}
    </div>
  );
}
