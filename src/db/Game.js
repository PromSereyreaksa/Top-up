import mongoose from "mongoose"

// Check if the model is already defined to prevent overwriting
const GameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String }, // Add this field for Cloudinary public ID
  discount: String,
  description: String,
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Use mongoose.models to check if the model exists already
const Game = mongoose.models.Game || mongoose.model("Game", GameSchema)

export default Game
