import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KalaSetu — Where Craft Meets Intelligence",
  description:
    "AI-powered artisan marketplace connecting skilled craftspeople with discerning buyers. Discover authentic handmade crafts from India's finest artisans.",
  keywords: [
    "handmade", "artisan", "craft", "India", "pottery", "textiles",
    "jewelry", "woodwork", "marketplace", "AI", "handcrafted",
  ],
  openGraph: {
    title: "KalaSetu — Where Craft Meets Intelligence",
    description: "AI-powered artisan marketplace. Discover authentic handmade crafts.",
    type: "website",
    locale: "en_IN",
    siteName: "KalaSetu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
