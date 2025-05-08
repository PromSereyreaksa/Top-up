<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PromotionBanner from "@/components/Promotion";

=======
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import PromotionBanner from "@/components/Promotion"
>>>>>>> b2f94eae33aa4770fc6be1b78a0c3e16fbe9809c

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Top up for sell",
  description: "",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {" "}
        <PromotionBanner />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
