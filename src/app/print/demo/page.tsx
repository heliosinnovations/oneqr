"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import RichTextEditor from "@/components/print/RichTextEditor";
import PrintPreview from "@/components/print/PrintPreview";
import "../[qrId]/print.css";

// Mock data for demo mode
const DEMO_QR_DATA = {
  id: "demo",
  title: "Demo QR Code",
  short_code: "demo123",
  destination_url: "https://theqrspot.com",
};

export default function PrintDemoPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const [headerContent, setHeaderContent] = useState("");
  const [footerContent, setFooterContent] = useState("");

  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);

  // Generate QR code on mount
  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(DEMO_QR_DATA.destination_url, {
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
    };

    generateQR();

    // Load saved content from localStorage
    const savedHeader = localStorage.getItem("qr-demo-header");
    const savedFooter = localStorage.getItem("qr-demo-footer");

    if (savedHeader) setHeaderContent(savedHeader);
    if (savedFooter) setFooterContent(savedFooter);
  }, []);

  // Save to localStorage when content changes
  useEffect(() => {
    localStorage.setItem("qr-demo-header", headerContent);
  }, [headerContent]);

  useEffect(() => {
    localStorage.setItem("qr-demo-footer", footerContent);
  }, [footerContent]);

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
      localStorage.removeItem("qr-demo-header");
      localStorage.removeItem("qr-demo-footer");
    }
  };

  return (
    <div className="print-page min-h-screen bg-[var(--bg)] p-4 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Demo Mode Banner */}
        <div className="demo-banner mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            <strong>Demo Mode:</strong> This page uses mock data for testing. No
            authentication required.
          </span>
        </div>

        {/* Back Link */}
        <Link href="/" className="back-link">
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
          Back to Home
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
              <Link href="/" className="close-btn" aria-label="Close">
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
              </Link>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
