import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Global AQ Intelligence — AI-Powered Air Quality Forecasting",
  description:
    "Real-time up to 30-day PM2.5 forecasts powered by machine learning. Covering India, United States, United Kingdom, and Australia with confidence-graded predictions.",
  keywords: [
    "air quality",
    "PM2.5",
    "forecast",
    "machine learning",
    "India",
    "USA",
    "UK",
    "Australia",
  ],
  authors: [{ name: "Divyansh Ailani" }],
  openGraph: {
    title: "Global AQ Intelligence",
    description: "AI-Powered Air Quality Forecasting for 4 Countries",
    type: "website",
  },
};

import BackgroundEffects from "@/components/BackgroundEffects";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: '#11141c' }}>
        <BackgroundEffects />
        {children}
      </body>
    </html>
  );
}
