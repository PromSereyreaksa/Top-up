"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FaGamepad, FaBars, FaTimes, FaHome, FaInfoCircle, FaQuestionCircle, FaHeadset } from "react-icons/fa"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    closeMenu()

    if (pathname === "/") {
      // If already on home page, scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      // Navigate to home page
      router.push("/")
    }
  }

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault()
    closeMenu()

    if (pathname !== "/") {
      // If not on home page, navigate to home and then scroll
      router.push(`/#${sectionId}`)
      return
    }

    // Find the section element
    const section = document.getElementById(sectionId)
    if (section) {
      // Scroll to the section
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Add scroll event listener to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") return

      const sections = ["games", "how-it-works", "why-us"]
      const scrollPosition = window.scrollY + 100 // Add offset for navbar height

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId)
        if (section) {
          const sectionTop = section.offsetTop
          const sectionBottom = sectionTop + section.offsetHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            // Add active class to the corresponding nav item
            const navItems = document.querySelectorAll(".nav-item")
            navItems.forEach((item) => {
              if (item.getAttribute("href") === `#${sectionId}`) {
                item.classList.add("text-[#4cc9f0]")
              } else {
                item.classList.remove("text-[#4cc9f0]")
              }
            })
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 flex h-[70px] items-center justify-center bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-md">
      <div className="flex w-full max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center text-lg font-bold text-white no-underline"
          onClick={handleHomeClick}
        >
          <FaGamepad className="mr-2 text-xl text-[#4cc9f0]" />
          <span>Coppsary</span>
        </Link>

        <div className="cursor-pointer text-2xl text-white md:hidden" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul
          className={`absolute top-[70px] ${isOpen ? "left-0" : "-left-full"} flex w-full flex-col rounded-b-lg bg-[#1a1a2e] p-0 shadow-lg transition-all duration-500 md:static md:flex md:w-auto md:flex-row md:items-center md:bg-transparent md:p-0 md:shadow-none`}
        >
          <li className="flex h-[50px] w-full items-center md:h-[70px] md:w-auto">
            <Link
              href="/"
              className="flex h-full w-full items-center px-5 font-medium text-white no-underline transition-all duration-300 hover:bg-[rgba(76,201,240,0.1)] hover:text-[#4cc9f0] md:px-4"
              onClick={handleHomeClick}
            >
              <FaHome className="mr-2.5 text-lg text-[#4cc9f0] md:mr-1.5 md:text-base" />
              <span>Home</span>
            </Link>
          </li>
          <li className="flex h-[50px] w-full items-center md:h-[70px] md:w-auto">
            <a
              href="#games"
              className="nav-item flex h-full w-full items-center px-5 font-medium text-white no-underline transition-all duration-300 hover:bg-[rgba(76,201,240,0.1)] hover:text-[#4cc9f0] md:px-4"
              onClick={(e) => handleSectionClick(e, "games")}
            >
              <FaGamepad className="mr-2.5 text-lg text-[#4cc9f0] md:mr-1.5 md:text-base" />
              <span>Games</span>
            </a>
          </li>
          <li className="flex h-[50px] w-full items-center md:h-[70px] md:w-auto">
            <a
              href="#how-it-works"
              className="nav-item flex h-full w-full items-center px-5 font-medium text-white no-underline transition-all duration-300 hover:bg-[rgba(76,201,240,0.1)] hover:text-[#4cc9f0] md:px-4"
              onClick={(e) => handleSectionClick(e, "how-it-works")}
            >
              <FaInfoCircle className="mr-2.5 text-lg text-[#4cc9f0] md:mr-1.5 md:text-base" />
              <span>How It Works</span>
            </a>
          </li>
          <li className="flex h-[50px] w-full items-center md:h-[70px] md:w-auto">
            <a
              href="#why-us"
              className="nav-item flex h-full w-full items-center px-5 font-medium text-white no-underline transition-all duration-300 hover:bg-[rgba(76,201,240,0.1)] hover:text-[#4cc9f0] md:px-4"
              onClick={(e) => handleSectionClick(e, "why-us")}
            >
              <FaQuestionCircle className="mr-2.5 text-lg text-[#4cc9f0] md:mr-1.5 md:text-base" />
              <span>Why Us</span>
            </a>
          </li>
          <li className="flex h-[50px] w-full items-center md:h-[70px] md:w-auto">
            <Link
              href="/support"
              className="flex h-full w-full items-center px-5 font-medium text-white no-underline transition-all duration-300 hover:bg-[rgba(76,201,240,0.1)] hover:text-[#4cc9f0] md:px-4"
              onClick={closeMenu}
            >
              <FaHeadset className="mr-2.5 text-lg text-[#4cc9f0] md:mr-1.5 md:text-base" />
              <span>Support</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
