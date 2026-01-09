import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Portfolio | Advertising & Creative Professional",
  description: "Creative portfolio showcasing graphic design work. Advertising & Creative Professional.",
  keywords: ["portfolio", "graphic design", "creative", "advertising", "visual design"],
  authors: [{ name: "Designer" }],
  openGraph: {
    title: "Portfolio | Advertising & Creative Professional",
    description: "Creative portfolio showcasing graphic design work.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
