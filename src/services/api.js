export async function getGamePackages(gameId) {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    return getFallbackPackages(gameId)
  }
  
  function getFallbackGameInfo(id) {
    const games = {
      "mobile-legends": {
        name: "Mobile Legends",
        currency: "Diamonds",
        image: "/images/mobile-legends.jpg",
        description:
          "Mobile Legends: Bang Bang is a mobile multiplayer online battle arena (MOBA) game developed and published by Moonton.",
      },
      "free-fire": {
        name: "Free Fire",
        currency: "Diamonds",
        image: "/images/free-fire.jpg",
        description:
          "Garena Free Fire is a battle royale game, developed by 111 Dots Studio and published by Garena for Android and iOS.",
      },
      "clash-of-clans": {
        name: "Clash of Clans",
        currency: "Gems",
        image: "/images/clash-of-clans.jpg",
        description:
          "Clash of Clans is a free-to-play mobile strategy video game developed and published by Finnish game developer Supercell.",
      },
      "magic-chess": {
        name: "Magic Chess",
        currency: "Diamonds",
        image: "/images/magic-chess.jpg",
        description:
          "Magic Chess is an auto-battler game mode in Mobile Legends: Bang Bang where players compete against seven other players.",
      },
      "league-of-legends": {
        name: "League of Legends",
        currency: "Riot Points",
        image: "/images/league-of-legends.jpg",
        description: "League of Legends is a team-based strategy game developed and published by Riot Games.",
      },
    }
  
    return (
      games[id] || {
        name: "Unknown Game",
        currency: "Credits",
        image: "/images/placeholder.jpg",
        description: "Game information not available.",
      }
    )
  }
  
  export function getFallbackPackages(id) {
    const gameInfo = getFallbackGameInfo(id)
  
    let packages = []
  
    if (id === "mobile-legends" || id === "free-fire" || id === "magic-chess") {
      packages = [
        { id: 1, name: "50 Diamonds", amount: 50, price: 2.5, currency: "Diamonds" },
        { id: 2, name: "100 Diamonds", amount: 100, price: 5, currency: "Diamonds" },
        { id: 3, name: "310 Diamonds", amount: 310, price: 10, currency: "Diamonds" },
        { id: 4, name: "520 Diamonds", amount: 520, price: 15, currency: "Diamonds" },
        { id: 5, name: "1060 Diamonds", amount: 1060, price: 30, currency: "Diamonds" },
        { id: 6, name: "2180 Diamonds", amount: 2180, price: 60, currency: "Diamonds" },
      ]
    } else if (id === "clash-of-clans") {
      packages = [
        { id: 1, name: "80 Gems", amount: 80, price: 1, currency: "Gems" },
        { id: 2, name: "500 Gems", amount: 500, price: 5, currency: "Gems" },
        { id: 3, name: "1200 Gems", amount: 1200, price: 10, currency: "Gems" },
        { id: 4, name: "2500 Gems", amount: 2500, price: 20, currency: "Gems" },
        { id: 5, name: "6500 Gems", amount: 6500, price: 50, currency: "Gems" },
        { id: 6, name: "14000 Gems", amount: 14000, price: 100, currency: "Gems" },
      ]
    } else if (id === "league-of-legends") {
      packages = [
        { id: 1, name: "650 RP", amount: 650, price: 5, currency: "Riot Points" },
        { id: 2, name: "1380 RP", amount: 1380, price: 10, currency: "Riot Points" },
        { id: 3, name: "2800 RP", amount: 2800, price: 20, currency: "Riot Points" },
        { id: 4, name: "5600 RP", amount: 5600, price: 40, currency: "Riot Points" },
        { id: 5, name: "11000 RP", amount: 11000, price: 75, currency: "Riot Points" },
      ]
    } else {
      packages = [
        { id: 1, name: "Small Package", amount: 100, price: 5, currency: "Credits" },
        { id: 2, name: "Medium Package", amount: 300, price: 10, currency: "Credits" },
        { id: 3, name: "Large Package", amount: 500, price: 15, currency: "Credits" },
        { id: 4, name: "Premium Package", amount: 1000, price: 30, currency: "Credits" },
      ]
    }
  
    return { gameInfo, packages }
  }
  