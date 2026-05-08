import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AUS - Automation Upload Song | Suno to DistroKid",
  description: "Automate the complete workflow of downloading songs from Suno AI and uploading them to DistroKid. A Playwright-powered pipeline.",
  keywords: ["Suno AI", "DistroKid", "Music Automation", "Playwright", "Auto Upload", "Bot"],
  authors: [{ name: "Aditya K." }],
  creator: "Aditya K.",
  publisher: "AUS",
  openGraph: {
    title: "AUS - Automation Upload Song",
    description: "Automate song downloads from Suno AI and uploads to DistroKid seamlessly.",
    siteName: "AUS Automation",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
