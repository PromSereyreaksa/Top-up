import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  gameName: { type: String, required: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  userId: { type: String, required: true },
  serverId: { type: String },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  fulfillmentStatus: {
    type: String,
    enum: ["pending", "delivered", "failed"],
    default: "pending",
  },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String },
})

// Use mongoose.models to check if the model exists already
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema)

export default Order
