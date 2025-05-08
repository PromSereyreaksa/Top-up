import mongoose from "mongoose"

const SiteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ["text", "image", "json", "boolean"], default: "text" },
  updatedAt: { type: Date, default: Date.now },
})

// Use mongoose.models to check if the model exists already
const SiteSetting = mongoose.models.SiteSetting || mongoose.model("SiteSetting", SiteSettingSchema)

export default SiteSetting
