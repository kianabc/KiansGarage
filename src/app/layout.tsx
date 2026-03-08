import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kian's Garage | Quality Bikes For Sale",
  description:
    "Hand-picked, well-maintained bikes from a rider who actually cares. Mountain bikes, e-MTBs, road bikes, and more.",
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
