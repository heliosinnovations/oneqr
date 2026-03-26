import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider, PostHogPageview } from "@/lib/posthog";
import { Suspense } from "react";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = "https://theqrspot.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Free QR Code Generator | The QR Spot - Create, Download, Print",
  description:
    "Generate unlimited QR codes for free with The QR Spot. Create, download as PNG or SVG, and print instantly. No signup required, no expiration, no hidden fees. The simplest QR code maker online.",
  keywords: [
    "free QR code generator",
    "QR code maker",
    "create QR code",
    "QR code creator",
    "generate QR code",
    "QR code free",
    "QR code online",
    "download QR code",
    "print QR code",
  ],
  authors: [{ name: "Helios Innovations" }],
  creator: "Helios Innovations",
  publisher: "Helios Innovations",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "The QR Spot",
    title: "Free QR Code Generator | The QR Spot - Create, Download, Print",
    description:
      "Generate unlimited QR codes for free. Create, download as PNG or SVG, and print instantly. No signup, no expiration, no hidden fees.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The QR Spot - Free QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QR Code Generator | The QR Spot - Create, Download, Print",
    description:
      "Generate unlimited QR codes for free. Create, download as PNG or SVG, and print instantly. No signup, no expiration, no hidden fees.",
    images: ["/og-image.png"],
    creator: "@heliosinnovations",
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fffef9",
};

// JSON-LD Structured Data
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The QR Spot",
  url: siteUrl,
  description:
    "Generate unlimited QR codes for free with The QR Spot. Create, download as PNG or SVG, and print instantly.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The QR Spot",
  url: siteUrl,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free QR code generator. Create, download, and print unlimited QR codes without signup or expiration.",
  featureList: [
    "Unlimited QR code generation",
    "Download as PNG or SVG",
    "Print directly from browser",
    "No signup required",
    "No expiration dates",
    "Free forever",
  ],
  screenshot: `${siteUrl}/og-image.png`,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Helios Innovations",
  url: "https://heliosinnovations.com",
  logo: `${siteUrl}/logo.png`,
  sameAs: ["https://twitter.com/heliosinnovations"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@heliosinnovations.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      </head>
      <body>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageview />
          </Suspense>
          {/* Grain texture overlay */}
          <div className="grain" aria-hidden="true" />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
