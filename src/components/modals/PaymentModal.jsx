"use client"

import { useState } from "react"
import { FaArrowLeft, FaCreditCard, FaQrcode, FaCheckCircle } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const PaymentModal = ({ isOpen, onClose, onBack, onNext }) => {
  const { selectedGame, selectedPackage, userId, serverId, setPaymentMethod, setOrderDetails } = useGameContext()

  const [loading, setLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [orderId, setOrderId] = useState(null)

  // Return null if required data is missing
  if (!selectedGame || !selectedPackage || !userId) {
    return null
  }

  const paymentMethods = [
    { id: "aceleda", name: "Aceleda Bank", icon: <FaCreditCard /> },
    { id: "aba", name: "ABA Bank", icon: <FaCreditCard /> },
  ]

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment)
    setQrCode(null)
  }

  const handleGenerateQR = async () => {
    if (!selectedPayment) return

    setQrLoading(true)
    setError(null)

    try {
      // Create order data
      const orderData = {
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: selectedPackage.amount,
        price: selectedPackage.price,
        currency: selectedPackage.currency || "USD",
        userId: userId,
        serverId: serverId || "",
        paymentMethod: selectedPayment.id,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
      }

      // Create an order in the database
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderResult = await orderResponse.json()
      setOrderId(orderResult.orderId)

      // Generate QR code for payment
      // In a real app, you would call the payment gateway API
      // For now, we'll simulate a QR code response
      const qrResponse = {
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + orderResult.orderId,
        expiresIn: 900, // 15 minutes in seconds
      }

      setQrCode(qrResponse)
      setPaymentMethod(selectedPayment)
      setOrderDetails({
        orderId: orderResult.orderId,
        ...orderData,
      })
    } catch (err) {
      console.error("Failed to generate QR code:", err)
      setError("Failed to generate QR code. Please try again.")
    } finally {
      setQrLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)

      // Update the order status in the database
      const updateResponse = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "paid",
          transactionId: "TXN" + Math.floor(Math.random() * 1000000),
          updatedAt: new Date(),
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update payment status")
      }

      // Move to next step
      onNext()
    } catch (err) {
      console.error("Payment confirmation error:", err)
      setError("Failed to confirm payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment" size="medium">
      <div className="flex flex-col gap-4">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h2 className="text-base font-medium mb-3 text-gray-800">Order Summary</h2>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Game:</span>
              <span className="font-semibold">{selectedGame?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Package:</span>
              <span className="font-semibold">{selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Game ID:</span>
              <span className="font-semibold">{userId}</span>
            </div>
            {serverId && (
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Server ID:</span>
                <span className="font-semibold">{serverId}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold mt-1.5 pt-1.5 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-blue-600">${selectedPackage?.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
            <span>{error}</span>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <h2 className="text-base font-medium mb-3 text-gray-800">Select Payment Method</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paymentMethods.map((payment) => (
              <div
                key={payment.id}
                className={`flex flex-col items-center gap-1.5 p-2.5 border-2 rounded-lg cursor-pointer transition-all relative
                  ${selectedPayment?.id === payment.id ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
                onClick={() => handlePaymentSelect(payment)}
              >
                <div className="text-xl text-blue-600">{payment.icon}</div>
                <span className="text-sm">{payment.name}</span>
                {selectedPayment?.id === payment.id && (
                  <div className="absolute -top-1.5 -right-1.5 bg-blue-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    <FaCheckCircle />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generate QR Button */}
        {selectedPayment && !qrCode && (
          <div className="flex justify-center my-4">
            <button
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md font-medium text-sm text-white
                bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-400
                transition-all ${qrLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={handleGenerateQR}
              disabled={qrLoading}
            >
              {qrLoading ? "Generating..." : "Generate QR Code"} {!qrLoading && <FaQrcode />}
            </button>
          </div>
        )}

        {/* QR Code Section */}
        {qrCode && (
          <div className="flex flex-col items-center my-2.5">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Scan QR Code to Pay</h2>
            <div className="p-3 bg-white rounded-lg shadow-md mb-3">
              <img src={qrCode.qrCode || "/placeholder.svg"} alt="Payment QR Code" className="w-40 h-auto" />
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg mb-3 w-full">
              <p className="m-0 leading-relaxed text-sm">
                1. Open your {selectedPayment.name} mobile app
                <br />
                2. Scan the QR code above
                <br />
                3. Complete the payment of ${selectedPackage?.price.toFixed(2)}
                <br />
                4. Click the button below after payment
              </p>
            </div>
            <div className="mb-4 font-medium text-sm">
              <span>Order ID: {orderId}</span>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-md font-medium text-sm text-white
                bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-r hover:from-green-700 hover:to-green-500
                transition-all"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "I've Completed the Payment"} {!loading && <FaCheckCircle />}
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-start mt-1">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm
              bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            onClick={onBack}
            disabled={loading}
          >
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PaymentModal
