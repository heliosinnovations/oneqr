import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Advanced QR Code Generator | The QR Spot - Create Custom QR Codes",
  description:
    "Create stunning, customized QR codes with our advanced generator. Full control over colors, patterns, logos, labels, and export formats. Free to generate, pay once to edit.",
  keywords: [
    "QR code generator",
    "custom QR code",
    "QR code design",
    "QR code colors",
    "QR code logo",
    "advanced QR generator",
  ],
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
