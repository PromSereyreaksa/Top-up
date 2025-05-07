"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaArrowLeft, FaCreditCard, FaQrcode, FaCheckCircle } from "react-icons/fa"
import { useGameContext } from "@/context/GameContext"

export default function PaymentPage() {
  const router = useRouter()
  const { selectedGame, selectedPackage, userId, serverId, setPaymentMethod, setOrderDetails } = useGameContext()

  const [loading, setLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [orderId, setOrderId] = useState(null)

  // Redirect if required data is missing
  useEffect(() => {
    if (!selectedGame || !selectedPackage || !userId) {
      router.push("/")
    }
  }, [selectedGame, selectedPackage, userId, router])

  const paymentMethods = [
    { id: "aceleda", name: "Aceleda Bank", icon: <FaCreditCard /> },
    { id: "aba", name: "ABA Bank", icon: <FaCreditCard /> },
  ]

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment)
    setQrCode(null)
  }

  const handleBack = () => {
    router.push("/verify")
  }

  const handleGenerateQR = async () => {
    if (!selectedPayment) return

    setQrLoading(true)
    setError(null)

    try {
      // First create an order
      const orderData = {
        gameId: selectedGame?.id,
        packageId: selectedPackage?.id,
        userId: userId,
        serverId: serverId || "",
        amount: selectedPackage?.amount,
        price: selectedPackage?.price,
        paymentMethod: selectedPayment.id,
      }

      // In a real app, you would create an order in the database
      // For now, we'll simulate a successful order creation
      const orderResponse = {
        orderId: "ORD" + Math.floor(Math.random() * 1000000),
        ...orderData,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      setOrderId(orderResponse.orderId)

      // Then generate QR code for payment
      // In a real app, you would call the payment gateway API
      // For now, we'll simulate a QR code response
      const qrResponse = {
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + orderResponse.orderId,
        expiresIn: 900, // 15 minutes in seconds
      }

      setQrCode(qrResponse)
      setPaymentMethod(selectedPayment)
      setOrderDetails({
        orderId: orderResponse.orderId,
        ...orderData,
      })
    } catch (err) {
      setError("Failed to generate QR code. Please try again.")
    } finally {
      setQrLoading(false)
    }
  }

  const handleConfirmPayment = () => {
    router.push("/confirmation")
  }

  if (!selectedGame || !selectedPackage) {
    return null
  }

  return (
    <div className="py-10 px-5 flex justify-center">
      <div className="max-w-[600px] w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Payment</h1>

        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Order Summary</h2>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Game:</span>
              <span className="font-semibold">{selectedGame.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Package:</span>
              <span className="font-semibold">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Game ID:</span>
              <span className="font-semibold">{userId}</span>
            </div>
            {serverId && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Server ID:</span>
                <span className="font-semibold">{serverId}</span>
              </div>
            )}
            <div className="flex justify-between pt-2.5 mt-2.5 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total:</span>
              <span className="font-bold text-blue-600">${selectedPackage.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-center">
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Select Payment Method</h2>
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((payment) => (
              <div
                key={payment.id}
                className={`flex flex-col items-center gap-2.5 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-cyan-400 relative ${
                  selectedPayment?.id === payment.id ? "border-cyan-400 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => handlePaymentSelect(payment)}
              >
                <div className="text-3xl text-blue-600">{payment.icon}</div>
                <span>{payment.name}</span>
                {selectedPayment?.id === payment.id && (
                  <div className="absolute -top-2.5 -right-2.5 bg-cyan-400 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <FaCheckCircle className="text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedPayment && !qrCode && (
          <div className="flex justify-center mb-6">
            <button
              className="flex items-center gap-2.5 py-3 px-6 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium transition-all hover:from-blue-600 hover:to-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleGenerateQR}
              disabled={qrLoading}
            >
              {qrLoading ? "Generating..." : "Generate QR Code"} {!qrLoading && <FaQrcode />}
            </button>
          </div>
        )}

        {qrCode && (
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-lg font-medium mb-5 text-gray-900">Scan QR Code to Pay</h2>
            <div className="p-5 bg-white rounded-lg shadow-md mb-5">
              <img
                src={qrCode.qrCode || "/placeholder.svg?height=200&width=200"}
                alt="Payment QR Code"
                className="max-w-[200px]"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-5 w-full">
              <p className="text-gray-700 leading-relaxed">
                1. Open your {selectedPayment.name} mobile app
                <br />
                2. Scan the QR code above
                <br />
                3. Complete the payment of ${selectedPackage.price.toFixed(2)}
                <br />
                4. Click the button below after payment
              </p>
            </div>
            <div className="mb-5 font-medium">
              <span>Order ID: {orderId}</span>
            </div>
            <button
              className="flex items-center gap-2.5 py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-medium transition-all hover:from-green-600 hover:to-green-500"
              onClick={handleConfirmPayment}
            >
              I've Completed the Payment <FaCheckCircle />
            </button>
          </div>
        )}

        <div className="flex">
          <button
            type="button"
            className="flex items-center gap-2 py-3 px-5 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>
    </div>
  )
}
