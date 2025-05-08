import HomePage from "@/components/HomePage"
import { GameProvider } from "@/context/GameContext"
import Footer from "@/components/Footer"
import StructuredData from "@/components/StructuredData"

export default function Home() {
  // Structured data for the organization
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Coppsary Bok Luy",
    url: "https://yourdomain.com",
    logo: "https://yourdomain.com/images/logo.png",
    sameAs: [
      "https://web.facebook.com/profile.php?id=61567582710788",
      "https://discord.gg/Z396cHUP7G",
      "https://www.tiktok.com/@coppsary",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+855-XX-XXX-XXX",
      contactType: "customer service",
      availableLanguage: ["English", "Khmer"],
    },
  }

  // Structured data for the service
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Game Top-Up Service",
    provider: {
      "@type": "Organization",
      name: "Coppsary Bok Luy",
    },
    description: "Fast and reliable game top-up service for Mobile Legends, PUBG Mobile, Free Fire, and more.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "1",
      highPrice: "100",
    },
  }

  return (
    <div>
      <StructuredData data={organizationData} />
      <StructuredData data={serviceData} />
      <GameProvider>
        <HomePage />
        <Footer />
      </GameProvider>
    </div>
  )
}
