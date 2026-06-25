import type { Metadata } from "next";
// Force Next.js CSS hot reload
import "./globals.css";

export const metadata: Metadata = {
  title: "Global AQ Intelligence — Air Quality Forecasting",
  description:
    "30-day PM2.5 forecasts for India, US, UK, and Australia powered by gradient-boosted ML models trained on 3.3M+ station observations.",
  keywords: ["air quality", "PM2.5", "forecast", "machine learning"],
  authors: [{ name: "Divyansh Ailani" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: "100%" }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var saved = localStorage.getItem("theme");
                if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  document.documentElement.setAttribute("data-theme", "dark");
                } else {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body style={{ height: "100%", background: "var(--bg)" }}>
        {children}
      </body>
    </html>
  );
}
