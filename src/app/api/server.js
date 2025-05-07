// server.js - Express server setup
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gameshop", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Game model
const gameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  discount: String,
  description: String,
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Game = mongoose.model("Game", gameSchema)

// Routes
// GET all games
app.get("/api/games", async (req, res) => {
  try {
    const games = await Game.find()
    res.json(games)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET featured games
app.get("/api/games/featured", async (req, res) => {
  try {
    const featuredGames = await Game.find({ featured: true })
    res.json(featuredGames)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET single game
app.get("/api/games/:id", async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id })
    if (!game) {
      return res.status(404).json({ message: "Game not found" })
    }
    res.json(game)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create new game
app.post("/api/games", async (req, res) => {
  const game = new Game({
    id: req.body.id,
    name: req.body.name,
    image: req.body.image,
    discount: req.body.discount,
    description: req.body.description,
    featured: req.body.featured || false,
  })

  try {
    const newGame = await game.save()
    res.status(201).json(newGame)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update game
app.put("/api/games/:id", async (req, res) => {
  try {
    req.body.updatedAt = Date.now()
    const updatedGame = await Game.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })

    if (!updatedGame) {
      return res.status(404).json({ message: "Game not found" })
    }

    res.json(updatedGame)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE game
app.delete("/api/games/:id", async (req, res) => {
  try {
    const deletedGame = await Game.findOneAndDelete({ id: req.params.id })

    if (!deletedGame) {
      return res.status(404).json({ message: "Game not found" })
    }

    res.json({ message: "Game deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Seed initial data
const seedGames = async () => {
  const gamesCount = await Game.countDocuments()
  if (gamesCount === 0) {
    const initialGames = [
      {
        id: "mobile-legends",
        name: "Mobile Legends",
        image: "/images/mobile-legends.jpg",
        discount: "10% OFF",
        description: "Get bonus diamonds on all packages",
        featured: true,
      },
      {
        id: "free-fire",
        name: "Free Fire",
        image: "/images/free-fire.jpg",
      },
      {
        id: "pubg-mobile",
        name: "PUBG Mobile",
        image: "/images/pubg-mobile.jpg",
        discount: "15% OFF",
        description: "Special weekend offer on UC purchases",
        featured: true,
      },
      {
        id: "call-of-duty-mobile",
        name: "Call of Duty Mobile",
        image: "/images/call-of-duty-mobile.jpg",
        discount: "20% OFF",
        description: "Limited time promotion on CP packages",
        featured: true,
      },
      {
        id: "clash-of-clans",
        name: "Clash of Clans",
        image: "/images/clash-of-clans.jpg",
      },
      {
        id: "magic-chess",
        name: "Magic Chess",
        image: "/images/magic-chess.jpg",
      },
      {
        id: "league-of-legends",
        name: "League of Legends",
        image: "/images/league-of-legends.jpg",
      },
    ]

    try {
      await Game.insertMany(initialGames)
      console.log("Database seeded with initial games data")
    } catch (err) {
      console.error("Error seeding database:", err)
    }
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await seedGames()
})

module.exports = app
