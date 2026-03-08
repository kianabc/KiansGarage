import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garage Door Bikes | Quality Bikes For Sale",
  description:
    "A curated bike marketplace where every listing is inspected and approved. Riders selling to riders. No junk gets through.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
