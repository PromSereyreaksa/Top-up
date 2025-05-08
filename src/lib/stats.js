import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"

export async function getDashboardStats() {
  await dbConnect()

  // Get today's date at midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get daily orders
  const dailyOrders = await Order.countDocuments({
    createdAt: { $gte: today },
  })

  // Get total revenue
  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ])
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

  // Get daily revenue
  const dailyRevenueResult = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ])
  const dailyRevenue = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0

  // Get successful top-ups
  const successfulTopUps = await Order.countDocuments({
    fulfillmentStatus: "delivered",
  })

  // Get pending vs completed orders
  const pendingOrders = await Order.countDocuments({
    fulfillmentStatus: "pending",
  })

  const completedOrders = await Order.countDocuments({
    fulfillmentStatus: "delivered",
  })

  const failedOrders = await Order.countDocuments({
    fulfillmentStatus: "failed",
  })

  // Get orders by game
  const ordersByGame = await Order.aggregate([
    { $group: { _id: "$gameName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])

  // Get recent orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

  // Get daily orders for the past week
  const pastWeek = new Date()
  pastWeek.setDate(pastWeek.getDate() - 7)

  const dailyOrdersData = await Order.aggregate([
    { $match: { createdAt: { $gte: pastWeek } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Format for chart
  const chartData = dailyOrdersData.map((item) => ({
    date: item._id,
    orders: item.count,
  }))

  return {
    dailyOrders,
    totalRevenue,
    dailyRevenue,
    successfulTopUps,
    orderStatus: {
      pending: pendingOrders,
      completed: completedOrders,
      failed: failedOrders,
    },
    ordersByGame,
    recentOrders,
    chartData,
  }
}
