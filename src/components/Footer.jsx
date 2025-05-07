"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FaFacebook, FaGamepad, FaDiscord, FaTiktok } from "react-icons/fa"

const Footer = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handleHomeClick = (e) => {
    e.preventDefault()
    if (pathname === "/") {
      window.scrollTo(0, 0)
    } else {
      router.push("/")
    }

    window.scrollTo(0, 0)
  }

  return (
    <footer className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-16 pb-5">
      <div className="flex flex-wrap justify-between max-w-7xl mx-auto px-6">
        <div className="flex-1 min-w-[200px] mb-8 px-4">
          <div className="flex items-center text-2xl font-bold mb-4">
            <FaGamepad className="mr-2 text-3xl text-[#4cc9f0]" />
            <span>Coppsary Bok luy</span>
          </div>
          <p className="text-gray-400 leading-relaxed mb-5">
            The fastest and most reliable game top-up service in Cambodia. Get your game credits instantly at the best
            prices.
          </p>
          <div className="flex gap-4">
            <a
              href="https://web.facebook.com/profile.php?id=61567582710788"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-2xl hover:text-[#4cc9f0] transition-colors duration-300"
            >
              <FaFacebook />
            </a>
            <a
              href="https://discord.gg/Z396cHUP7G"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-2xl hover:text-[#4cc9f0] transition-colors duration-300"
            >
              <FaDiscord />
            </a>
            <a
              href="https://www.tiktok.com/@coppsary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-2xl hover:text-[#4cc9f0] transition-colors duration-300"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        <div className="flex-1 min-w-[200px] mb-8 px-4">
          <h3 className="text-xl mb-5 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[50px] after:h-[2px] after:bg-[#4cc9f0]">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/"
                onClick={handleHomeClick}
                className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <a href="/#games" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                Games
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                How It Works
              </a>
            </li>
            <li>
              <a href="/#why-us" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                Why Us
              </a>
            </li>
            <li>
              <Link href="/support" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 min-w-[200px] mb-8 px-4">
          <h3 className="text-xl mb-5 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[50px] after:h-[2px] after:bg-[#4cc9f0]">
            Support
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/support" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-[#4cc9f0] transition-colors duration-300">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center pt-5 mt-5 border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} Coppsary. All Rights Reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
