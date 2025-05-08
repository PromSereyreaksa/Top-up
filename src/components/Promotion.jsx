"use client"
import { useState, useEffect } from "react"
import { FaGift, FaTimes, FaArrowRight } from "react-icons/fa"

const PromotionBanner = ({ promotionText, enabled = true }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [promotionSettings, setPromotionSettings] = useState({
    text: promotionText || "ទទួលបានពេជ្របន្ថែម 20% លើការបញ្ចូលទឹកប្រាក់ Mobile Legends ចុងសប្តាហ៍នេះ!",
    enabled: enabled,
  })

  useEffect(() => {
    // Fetch promotion settings from API
    const fetchPromotionSettings = async () => {
      try {
        const res = await fetch("/api/settings?key=promotion")
        if (res.ok) {
          const data = await res.json()
          if (data && data.value) {
            setPromotionSettings({
              text: data.value.text || promotionSettings.text,
              enabled: data.value.enabled !== undefined ? data.value.enabled : true,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching promotion settings:", err)
      }
    }

    fetchPromotionSettings()
  }, [])

  // If promotion is disabled in settings, don't render
  if (!promotionSettings.enabled) {
    return null
  }

  // If user closed the promotion, don't render
  if (!isVisible) {
    return null
  }

  return (
    <div className="relative z-20 bg-gradient-to-r from-[#ff4e50] to-[#f9d423] p-3 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 md:flex-nowrap">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <FaGift className="text-lg text-white" />
        </div>
        <div className="min-w-[180px] flex-1 text-center">
          <p className="m-0 text-sm">
            <strong>Special Offer!</strong> {promotionSettings.text}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-[#ff4e50] transition-all duration-300 hover:bg-white/90 hover:shadow hover:-translate-y-0.5">
          <span>Claim Now</span>
          <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <button
          className="flex items-center justify-center p-1 text-white transition-transform duration-300 hover:rotate-90 md:absolute md:right-2 md:top-2"
          aria-label="Close promotion"
          onClick={() => setIsVisible(false)}
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-all duration-300 ${
              index === 0 ? "h-2 w-2 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default PromotionBanner
