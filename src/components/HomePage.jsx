"use client"

import { useState, useEffect, useRef } from "react"
import { FaGamepad, FaMoneyBillWave, FaShieldAlt, FaUserClock, FaHeadset, FaGift, FaStar, FaFire } from "react-icons/fa"
import TopUpFlow from "../components/TopUpFlow"
import { useGameContext } from "../context/GameContext"
import HeroSection from "./HeroSection"

const HomePage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState(null)
  const featuredGamesRef = useRef(null)
  const gamesRef = useRef(null)
  const { isTopUpInProgress } = useGameContext()
  const [heroImages, setHeroImages] = useState([])

  // Fallback games function to ensure all games are included
  const getAllFallbackGames = () => {
    return [
      { id: "mobile-legends", name: "Mobile Legends", image: "/images/mobile-legends.jpg" },
      { id: "free-fire", name: "Free Fire", image: "/images/free-fire.jpg" },
      { id: "pubg-mobile", name: "PUBG Mobile", image: "/images/pubg-mobile.jpg" },
      { id: "call-of-duty-mobile", name: "Call of Duty Mobile", image: "/images/call-of-duty-mobile.jpg" },
      { id: "clash-of-clans", name: "Clash of Clans", image: "/images/clash-of-clans.jpg" },
      { id: "magic-chess", name: "Magic Chess", image: "/images/magic-chess.jpg" },
      { id: "league-of-legends", name: "League of Legends", image: "/images/league-of-legends.jpg" },
    ]
  }

  // Use the updated fallback games function
  const fallbackGames = getAllFallbackGames()

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        console.log("Fetching games from API...")

        const res = await fetch("/api/games")

        if (!res.ok) {
          throw new Error(`Failed to fetch games: ${res.status}`)
        }

        const data = await res.json()
        console.log(`Fetched ${data.length} games successfully`)

        setGames(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching games:", err)
        setError(err.message || "Failed to fetch games")
        // Use fallback data if API fails
        setGames(fallbackGames)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()

    // Fetch hero images from settings
    const fetchHeroImages = async () => {
      try {
        const res = await fetch("/api/settings?key=heroImages")
        if (res.ok) {
          const data = await res.json()
          if (data && data.value && Array.isArray(data.value)) {
            setHeroImages(data.value)
          }
        }
      } catch (err) {
        console.error("Error fetching hero images:", err)
      }
    }

    fetchHeroImages()
  }, [])

  const [featuredGames, setFeaturedGames] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setFeaturedLoading(true)
        console.log("Fetching featured games from API...")

        const res = await fetch("/api/games/featured")

        if (!res.ok) {
          throw new Error(`Failed to fetch featured games: ${res.status}`)
        }

        const data = await res.json()
        console.log(`Fetched ${data.length} featured games successfully`)

        setFeaturedGames(data)
      } catch (err) {
        console.error("Error fetching featured games:", err)
        // Use fallback featured games if API fails
        setFeaturedGames([
          {
            id: "mobile-legends",
            name: "Mobile Legends",
            image: "/images/mobile-legends.jpg",
            discount: "10% OFF",
            description: "Get bonus diamonds on all packages",
          },
          {
            id: "pubg-mobile",
            name: "PUBG Mobile",
            image: "/images/pubg-mobile.jpg",
            discount: "15% OFF",
            description: "Special weekend offer on UC purchases",
          },
          {
            id: "call-of-duty-mobile",
            name: "Call of Duty Mobile",
            image: "/images/call-of-duty-mobile.jpg",
            discount: "20% OFF",
            description: "Limited time promotion on CP packages",
          },
        ])
      } finally {
        setFeaturedLoading(false)
      }
    }

    fetchFeaturedGames()
  }, [])

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sokha Chen",
      game: "Mobile Legends",
      rating: 5,
      comment: "Super fast delivery! I received my diamonds instantly after payment. Will definitely use again.",
      date: "2 days ago",
    },
    {
      id: 2,
      name: "Dara Kim",
      game: "Free Fire",
      rating: 5,
      comment: "Best prices I've found for Free Fire diamonds. The process was simple and quick.",
      date: "1 week ago",
    },
    {
      id: 3,
      name: "Vibol Meas",
      game: "Clash of Clans",
      rating: 4,
      comment: "Great service and support. They helped me when I had an issue with my payment.",
      date: "2 weeks ago",
    },
  ]

  const openTopUpModal = (gameId = null) => {
    // Prevent opening multiple top-up flows
    if (isTopUpInProgress) {
      console.log("Top-up already in progress, ignoring request")
      return
    }

    if (gameId) {
      console.log("Opening top-up modal for game:", gameId)
      // Find the game in our local data to ensure we have the details
      const gameData = games.find((game) => game.id === gameId) || fallbackGames.find((game) => game.id === gameId)

      if (gameData) {
        // Set the selected game in context before opening modal
        setSelectedGameId(gameId)
        setIsTopUpModalOpen(true)
      } else {
        console.error("Game not found:", gameId)
        // Use fallback approach - just open modal without pre-selecting
        setSelectedGameId(null)
        setIsTopUpModalOpen(true)
      }
    } else {
      // No game selected, just open the modal
      setSelectedGameId(null)
      setIsTopUpModalOpen(true)
    }
  }

  const closeTopUpModal = () => {
    setIsTopUpModalOpen(false)
    setSelectedGameId(null)
  }

  const scrollToFeaturedGames = () => {
    if (featuredGamesRef.current) {
      featuredGamesRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToGames = () => {
    if (gamesRef.current) {
      gamesRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Generate star ratings
  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(<FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-200"} />)
    }
    return stars
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection
        openTopUpModal={openTopUpModal}
        scrollToFeaturedGames={scrollToFeaturedGames}
        heroImages={heroImages}
      />

      {/* Featured Games Section */}
      <section ref={featuredGamesRef} className="py-20 px-5 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">Special Promotions</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">Limited time offers on popular games</p>
        </div>

        {featuredLoading ? (
          <div className="text-center py-10 text-lg">Loading promotions...</div>
        ) : featuredGames.length === 0 ? (
          <div className="text-center py-10 text-lg text-gray-600">No promotions available at this time.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => openTopUpModal(game.id)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-yellow-400 text-white py-1 px-3 rounded-full font-bold text-sm flex items-center gap-1">
                    <FaFire className="text-xs" />
                    <span>{game.discount}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-gray-600 mb-5 text-sm">{game.description}</p>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-5 rounded transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <FaGift /> Claim Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Games Section */}
      <section id="games" ref={gamesRef} className="py-20 px-5 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">Popular Games</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Select your game to get started with the top-up process
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-lg">Loading games...</div>
        ) : error ? (
          <div className="text-center py-10 text-lg text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-5 max-w-6xl mx-auto">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                onClick={() => {
                  console.log("Game card clicked:", game.id)
                  openTopUpModal(game.id)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openTopUpModal(game.id)
                  }
                }}
              >
                <div className="h-30 overflow-hidden flex-shrink-0">
                  <img
                    src={game.image || `/images/${game.id}.jpg`}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <h3 className="p-3 text-center text-sm font-medium flex-grow flex items-center justify-center">
                  {game.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-5 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">Complete your top-up in just 3 simple steps</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="flex-1 min-w-[250px] max-w-[300px] text-center p-8 bg-gray-50 rounded-lg shadow-md relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="text-4xl text-blue-400 mb-4">
              <FaGamepad className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Select Game</h3>
            <p className="text-gray-600">Choose your game and the amount of credits you want to purchase</p>
          </div>

          <div className="flex-1 min-w-[250px] max-w-[300px] text-center p-8 bg-gray-50 rounded-lg shadow-md relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="text-4xl text-blue-400 mb-4">
              <FaUserClock className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Enter ID</h3>
            <p className="text-gray-600">Provide your game ID and server information for verification</p>
          </div>

          <div className="flex-1 min-w-[250px] max-w-[300px] text-center p-8 bg-gray-50 rounded-lg shadow-md relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="text-4xl text-blue-400 mb-4">
              <FaMoneyBillWave className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Make Payment</h3>
            <p className="text-gray-600">Complete the payment using your preferred method and get instant credits</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-5 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">Trusted by gamers across Cambodia</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-full max-w-sm bg-white rounded-lg p-6 shadow-md transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-4 text-xl">{renderStars(testimonial.rating)}</div>
              <p className="text-gray-700 mb-5 italic">"{testimonial.comment}"</p>
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-blue-400 text-sm">{testimonial.game}</div>
                <div className="text-gray-400 text-xs">{testimonial.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 px-5 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">Why Choose Us</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">We offer the best game top-up experience in Cambodia</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2 text-center">
            <div className="text-4xl text-blue-400 mb-4">
              <FaMoneyBillWave className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Competitive Pricing</h3>
            <p className="text-gray-600">We offer the best rates for game credits with no hidden fees</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2 text-center">
            <div className="text-4xl text-blue-400 mb-4">
              <FaUserClock className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Fast Service</h3>
            <p className="text-gray-600">Get your game credits instantly after payment confirmation</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2 text-center">
            <div className="text-4xl text-blue-400 mb-4">
              <FaShieldAlt className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">Secure & Reliable</h3>
            <p className="text-gray-600">Your transactions and personal information are always protected</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2 text-center">
            <div className="text-4xl text-blue-400 mb-4">
              <FaGamepad className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">No Login Required</h3>
            <p className="text-gray-600">Top up using just your game ID without sharing your password</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2 text-center">
            <div className="text-4xl text-blue-400 mb-4">
              <FaHeadset className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
            <p className="text-gray-600">Our customer support team is always ready to assist you</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-5 bg-gradient-to-r from-gray-900 to-blue-900 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-5">Ready to Top Up Your Game?</h2>
          <p className="text-lg text-gray-300 mb-8">Get started now and enjoy your game with extra credits</p>
          <button
            onClick={scrollToGames}
            className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Top Up Now
          </button>
        </div>
      </section>

      {/* TopUp Flow Modal */}
      <TopUpFlow
        isOpen={isTopUpModalOpen}
        onClose={closeTopUpModal}
        initialStep={selectedGameId ? "package" : "game"}
        gameId={selectedGameId}
      />
    </div>
  )
}

export default HomePage
