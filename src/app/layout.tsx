import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "OneQR - The QR Code That's Yours Forever",
  description:
    "Simple, honest QR code generator with no limits, no expiring codes, and no tricks. Free to generate, pay once to edit forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body>
        {/* Grain texture overlay */}
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
