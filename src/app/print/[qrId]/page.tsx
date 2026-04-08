"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "@/components/print/RichTextEditor";
import PrintPreview from "@/components/print/PrintPreview";
import "./print.css";

interface QRCodeData {
  id: string;
  title: string;
  short_code: string;
  destination_url: string;
}

export default function PrintPage({
  params,
}: {
  params: Promise<{ qrId: string }>;
}) {
  const { qrId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [headerContent, setHeaderContent] = useState("");
  const [footerContent, setFooterContent] = useState("");

  const [headerSpacing, setHeaderSpacing] = useState(16);
  const [footerSpacing, setFooterSpacing] = useState(16);

  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);

  // Load QR code data
  const fetchQRCode = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("qr_codes")
      .select("id, title, short_code, destination_url")
      .eq("id", qrId)
      .single();

    if (fetchError || !data) {
      console.error("Error fetching QR code:", fetchError);
      setError("QR code not found");
      setLoading(false);
      return;
    }

    setQrCode(data);

    // Generate high-quality QR code for print
    try {
      const dataUrl = await QRCode.toDataURL(data.destination_url, {
        width: 800,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }

    // Load saved content from localStorage
    const savedHeader = localStorage.getItem(`qr-${qrId}-header`);
    const savedFooter = localStorage.getItem(`qr-${qrId}-footer`);
    const savedHeaderSpacing = localStorage.getItem(
      `qr-${qrId}-header-spacing`
    );
    const savedFooterSpacing = localStorage.getItem(
      `qr-${qrId}-footer-spacing`
    );

    if (savedHeader) setHeaderContent(savedHeader);
    if (savedFooter) setFooterContent(savedFooter);
    if (savedHeaderSpacing) setHeaderSpacing(parseInt(savedHeaderSpacing));
    if (savedFooterSpacing) setFooterSpacing(parseInt(savedFooterSpacing));

    setLoading(false);
  }, [qrId, supabase]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  // Save to localStorage when content changes
  useEffect(() => {
    if (!loading && qrCode) {
      localStorage.setItem(`qr-${qrId}-header`, headerContent);
    }
  }, [headerContent, qrId, loading, qrCode]);

  useEffect(() => {
    if (!loading && qrCode) {
      localStorage.setItem(`qr-${qrId}-footer`, footerContent);
    }
  }, [footerContent, qrId, loading, qrCode]);

  useEffect(() => {
    if (!loading && qrCode) {
      localStorage.setItem(
        `qr-${qrId}-header-spacing`,
        headerSpacing.toString()
      );
    }
  }, [headerSpacing, qrId, loading, qrCode]);

  useEffect(() => {
    if (!loading && qrCode) {
      localStorage.setItem(
        `qr-${qrId}-footer-spacing`,
        footerSpacing.toString()
      );
    }
  }, [footerSpacing, qrId, loading, qrCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear all content? This cannot be undone."
      )
    ) {
      setHeaderContent("");
      setFooterContent("");
      setHeaderSpacing(16);
      setFooterSpacing(16);
      localStorage.removeItem(`qr-${qrId}-header`);
      localStorage.removeItem(`qr-${qrId}-footer`);
      localStorage.removeItem(`qr-${qrId}-header-spacing`);
      localStorage.removeItem(`qr-${qrId}-footer-spacing`);
    }
  };

  const handleClose = () => {
    router.push(`/dashboard/${qrId}`);
  };

  if (loading) {
    return (
      <div className="print-page flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading print settings...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="print-page flex min-h-screen items-center justify-center">
        <div className="error-message">
          <h2>QR Code Not Found</h2>
          <p>
            The QR code you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Link href="/dashboard" className="btn btn-primary inline-flex">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="print-page min-h-screen bg-[var(--bg)] p-4 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Back Link */}
        <Link href={`/dashboard/${qrId}`} className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to {qrCode.title}
        </Link>

        {/* Split Layout */}
        <div className="split-layout">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="editor-header">
              <div className="editor-header-left">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <h2>Print Settings</h2>
              </div>
              <button
                className="close-btn"
                aria-label="Close"
                onClick={handleClose}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="editor-body">
              {/* Header Section */}
              <div className={`section ${headerCollapsed ? "collapsed" : ""}`}>
                <div
                  className="section-header"
                  onClick={() => setHeaderCollapsed(!headerCollapsed)}
                >
                  <div className="section-title">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 7V4h16v3" />
                      <path d="M9 20h6" />
                      <path d="M12 4v16" />
                    </svg>
                    Header
                  </div>
                  <svg
                    className="section-toggle"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className="section-content">
                  <RichTextEditor
                    content={headerContent}
                    onChange={setHeaderContent}
                    placeholder="Add a title or heading..."
                    showLists={false}
                  />
                </div>
              </div>

              {/* Footer Section */}
              <div className={`section ${footerCollapsed ? "collapsed" : ""}`}>
                <div
                  className="section-header"
                  onClick={() => setFooterCollapsed(!footerCollapsed)}
                >
                  <div className="section-title">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Instructions
                  </div>
                  <svg
                    className="section-toggle"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className="section-content">
                  <RichTextEditor
                    content={footerContent}
                    onChange={setFooterContent}
                    placeholder="Add instructions or notes..."
                    showLists={true}
                  />
                </div>
              </div>

              {/* Spacing Controls */}
              <div className="spacing-controls">
                <h3 className="spacing-heading">Spacing</h3>

                <div className="spacing-control">
                  <label htmlFor="header-spacing">
                    Header Spacing: {headerSpacing}px
                  </label>
                  <input
                    id="header-spacing"
                    type="range"
                    min="0"
                    max="100"
                    step="4"
                    value={headerSpacing}
                    onChange={(e) => setHeaderSpacing(parseInt(e.target.value))}
                    className="spacing-slider"
                  />
                </div>

                <div className="spacing-control">
                  <label htmlFor="footer-spacing">
                    Footer Spacing: {footerSpacing}px
                  </label>
                  <input
                    id="footer-spacing"
                    type="range"
                    min="0"
                    max="100"
                    step="4"
                    value={footerSpacing}
                    onChange={(e) => setFooterSpacing(parseInt(e.target.value))}
                    className="spacing-slider"
                  />
                </div>
              </div>
            </div>

            <div className="editor-footer">
              <button className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
              <button className="btn btn-primary" onClick={handlePrint}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="preview-header">
              <div className="preview-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview
              </div>
              <div className="preview-actions">
                <button
                  className="btn-icon"
                  title="Print"
                  onClick={handlePrint}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="preview-body">
              <PrintPreview
                headerContent={headerContent}
                footerContent={footerContent}
                qrDataUrl={qrDataUrl}
                qrLabel="Scan Me"
                headerSpacing={headerSpacing}
                footerSpacing={footerSpacing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
