import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import PromotionBanner from "@/components/Promotion"
import GoogleAnalytics from "@/components/GoogleAnalytics"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Coppsary Bok Luy | Game Top-Up Service in Cambodia",
  description:
    "The fastest and most reliable game top-up service in Cambodia. Get your game credits instantly at the best prices for Mobile Legends, PUBG, Free Fire and more.",
  keywords: "game top-up, mobile legends, free fire, pubg mobile, cambodia, game credits, diamonds, UC, game currency",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Coppsary Bok Luy | Game Top-Up Service in Cambodia",
    description:
      "The fastest and most reliable game top-up service in Cambodia. Get your game credits instantly at the best prices.",
    url: "/",
    siteName: "Coppsary Bok Luy",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Coppsary Bok Luy - Game Top-Up Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coppsary Bok Luy | Game Top-Up Service in Cambodia",
    description:
      "The fastest and most reliable game top-up service in Cambodia. Get your game credits instantly at the best prices.",
    images: ["/images/og-image.jpg"],
  },
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
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_ID", // Replace with your Google verification ID
  },
}

export default function RootLayout({ children }) {
  // Replace with your actual Google Analytics ID
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX"

  return (
    <html lang="en">
      <head>
        {/* Google Search Console verification - replace with your verification code */}
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        <PromotionBanner />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
