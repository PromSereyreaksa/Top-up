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
  title: {
    template: '%s | Coppsary Bok Luy',
    default: 'Coppsary Bok Luy | #1 Game Top-Up Service in Cambodia',
  },
  description: 'Fast, secure and affordable game top-up service in Cambodia. Get instant Mobile Legends diamonds, PUBG UC, Free Fire diamonds with local payment methods.',
  keywords: 'game top-up Cambodia, Mobile Legends diamonds, PUBG UC Cambodia, Free Fire top-up, game credits Cambodia',
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'km': '/km',
    },
  },
  openGraph: {
    title: 'Coppsary Bok Luy | #1 Game Top-Up Service in Cambodia',
    description: 'Fast, secure and affordable game top-up service in Cambodia.',
    url: '/',
    siteName: 'Coppsary Bok Luy',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Coppsary Bok Luy - Game Top-Up Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Add other site-wide metadata here
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
