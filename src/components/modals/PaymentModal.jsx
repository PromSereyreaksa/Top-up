"use client"

import { useState, useEffect, useRef } from "react"
import { FaArrowLeft, FaCreditCard, FaQrcode, FaCheckCircle, FaShoppingCart, FaBug } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const PaymentModal = ({ isOpen, onClose, onBack, onNext }) => {
  const { selectedGame, selectedPackage, userId, serverId, setPaymentMethod, setOrderDetails, cart } = useGameContext()

  const [loading, setLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [dlPayUrl, setDlPayUrl] = useState(null)
  const [dlPayTransactionId, setDlPayTransactionId] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  // Use useRef instead of state for the interval
  const statusCheckIntervalRef = useRef(null)

  // State to track if required data is present
  const [hasRequiredData, setHasRequiredData] = useState(false)

  useEffect(() => {
    // Update hasRequiredData based on the presence of required data
    setHasRequiredData((selectedGame && selectedPackage && userId) || (cart && cart.length > 0))

    // Clean up interval on unmount
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }, [selectedGame, selectedPackage, userId, cart])

  // Return null if required data is missing
  if (!hasRequiredData) {
    return null
  }

  const paymentMethods = [
    { id: "dlpay", name: "DL PAY", icon: <FaCreditCard /> },
    { id: "aceleda", name: "Aceleda Bank", icon: <FaCreditCard /> },
    { id: "aba", name: "ABA Bank", icon: <FaCreditCard /> },
  ]

  const handlePaymentSelect = (payment) => {
    // Clear any existing status check interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current)
      statusCheckIntervalRef.current = null
    }

    setSelectedPayment(payment)
    setQrCode(null)
    setDlPayUrl(null)
    setError(null)
    setDebugInfo(null)
  }

  const checkPaymentStatus = async () => {
    if (!orderId || !dlPayTransactionId) return false

    try {
      setCheckingStatus(true)
      console.log(`Checking payment status for order: ${orderId}, transaction: ${dlPayTransactionId}`)

      // Try to get the order status
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        console.error(`Failed to get order status: ${response.status}`)
        return false
      }

      const orderData = await response.json()
      console.log("Order status check result:", orderData)

      // If payment is confirmed, clear interval and proceed
      if (orderData.paymentStatus === "paid") {
        console.log("Payment confirmed as paid!")
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current)
          statusCheckIntervalRef.current = null
        }

        // Move to next step
        onNext()
        return true
      }

      return false
    } catch (error) {
      console.error("Failed to check payment status:", error)
      return false
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleDebug = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug-dlpay")
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      console.error("Debug error:", err)
      setError("Failed to get debug information")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async () => {
    if (!selectedPayment) return

    setQrLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Determine if we're using cart or single item
      const isCartCheckout = cart && cart.length > 0

      // Create order data
      let orderData = {
        userId: userId,
        serverId: serverId || "",
        paymentMethod: selectedPayment.id,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
        currency: "USD",
      }

      // Add items if using cart
      if (isCartCheckout) {
        orderData.items = cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
        }))

        // Calculate total amount
        orderData.amount = cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
      }
      // Otherwise use selected game/package
      else {
        orderData = {
          ...orderData,
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          amount: selectedPackage.price,
          price: selectedPackage.price,
          items: [
            {
              productId: selectedPackage.id,
              name: selectedPackage.name,
              price: selectedPackage.price,
              quantity: 1,
            },
          ],
        }
      }

      // If using DL PAY, handle differently
      if (selectedPayment.id === "dlpay") {
        console.log("Using DL PAY for payment")

        try {
          // First create an order in the database to get an orderId
          const orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          })

          if (!orderResponse.ok) {
            const errorData = await orderResponse.json()
            throw new Error(errorData.error || errorData.message || "Failed to create order")
          }

          const orderResult = await orderResponse.json()
          const createdOrderId = orderResult.orderId
          setOrderId(createdOrderId)

          console.log(`Order created with ID: ${createdOrderId}`)

          // Create products array for DL Pay
          let products = []

          if (isCartCheckout) {
            products = cart.map((item) => ({
              name: item.name,
              price: item.price,
              productId: item.id.toString(),
              quantity: item.quantity || 1,
              image: item.image,
            }))
          } else {
            products = [
              {
                name: selectedPackage.name,
                price: selectedPackage.price,
                productId: selectedPackage.id.toString(),
                quantity: 1,
                image: selectedPackage.image,
              },
            ]
          }

          // Create a real checkout with the actual product details
          const dlPayPayload = {
            products: products,
            currency: "USD",
            metadata: {
              userId: userId,
              serverId: serverId || "",
              gameId: selectedGame?.id,
              gameName: selectedGame?.name,
              packageId: selectedPackage?.id,
              orderId: createdOrderId, // Include the orderId in metadata
            },
          }

          console.log("DL PAY payload:", JSON.stringify(dlPayPayload, null, 2))

          // Create the checkout directly from the client
          const dlPayResponse = await fetch("/api/create-dlpay-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: dlPayPayload,
            }),
          })

          if (!dlPayResponse.ok) {
            const errorData = await dlPayResponse.json()
            console.error("DL PAY error response:", errorData)
            throw new Error(errorData.error || `DL PAY request failed with status: ${dlPayResponse.status}`)
          }

          const dlPayData = await dlPayResponse.json()
          console.log("DL PAY response:", dlPayData)

          if (dlPayData.success) {
            // Store the DL PAY URL and transaction ID
            setDlPayUrl(dlPayData.redirectUrl)
            setDlPayTransactionId(dlPayData.transactionId)

            // Update the order with the transaction ID
            if (dlPayData.transactionId) {
              const updateResponse = await fetch(`/api/orders/${createdOrderId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transactionId: dlPayData.transactionId,
                }),
              })

              if (!updateResponse.ok) {
                console.warn("Failed to update order with transaction ID, but continuing...")
              }
            }

            setPaymentMethod(selectedPayment)
            setOrderDetails({
              orderId: createdOrderId,
              transactionId: dlPayData.transactionId,
              ...orderData,
            })

            // Set up polling to check payment status
            if (statusCheckIntervalRef.current) {
              clearInterval(statusCheckIntervalRef.current)
            }
            statusCheckIntervalRef.current = setInterval(checkPaymentStatus, 5000) // Check every 5 seconds

            // Automatically open the DL Pay window
            if (dlPayData.redirectUrl) {
              window.open(dlPayData.redirectUrl, "_blank")
            }
          } else {
            throw new Error(dlPayData.error || "Failed to create DL PAY checkout")
          }
        } catch (err) {
          console.error("DL PAY error:", err)
          setError(err.message || "Failed to create DL PAY checkout. Please try again.")
        }
      } else {
        // Original QR code flow for other payment methods
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
      }
    } catch (err) {
      console.error("Failed to generate payment:", err)
      setError(err.message || "Failed to generate payment. Please try again.")
    } finally {
      setQrLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)

      // For DL PAY, check payment status first
      if (selectedPayment?.id === "dlpay" && dlPayTransactionId) {
        const isPaid = await checkPaymentStatus()

        if (isPaid) {
          // Payment already confirmed, move to next step
          return
        }
      }

      // Update the order status in the database
      const updateResponse = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "paid",
          transactionId: dlPayTransactionId || "TXN" + Math.floor(Math.random() * 1000000),
          updatedAt: new Date(),
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || errorData.message || "Failed to update payment status")
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

  const handleOpenDlPay = () => {
    if (dlPayUrl) {
      window.open(dlPayUrl, "_blank")
    }
  }

  // Calculate total amount
  const calculateTotal = () => {
    if (cart && cart.length > 0) {
      return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
    }
    return selectedPackage?.price || 0
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment" size="medium">
      <div className="flex flex-col gap-4">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h2 className="text-base font-medium mb-3 text-gray-800">Order Summary</h2>

          {/* Cart items */}
          {cart && cart.length > 0 ? (
            <div className="flex flex-col gap-2 mb-3">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FaShoppingCart className="text-gray-400" />
                    <span>
                      {item.name} x {item.quantity || 1}
                    </span>
                  </div>
                  <span className="font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Game:</span>
                <span className="font-semibold">{selectedGame?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Package:</span>
                <span className="font-semibold">{selectedPackage?.name}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
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
              <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
            <span>{error}</span>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="space-y-1">
              <p>Environment: {debugInfo.environment}</p>
              <p>Secret Key: {debugInfo.configuration.secretKeyExists ? "✅" : "❌"} (Length: {debugInfo.configuration.secretKeyLength})</p>
              <p>API Key: {debugInfo.configuration.apiKeyExists ? "✅" : "❌"}</p>
              <p>Callback URL: {debugInfo.configuration.callbackUrl}</p>
              <p>Success URL: {debugInfo.configuration.successUrl}</p>
              <p>Cancel URL: {debugInfo.configuration.cancelUrl}</p>
            </div>
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
        {selectedPayment && !qrCode && !dlPayUrl && (
          <div className="flex justify-center my-4 gap-2">
            <button
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md font-medium text-sm text-white
                bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-400
                transition-all ${qrLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={handleGenerateQR}
              disabled={qrLoading}
            >
              {qrLoading
                ? "Generating..."
                : selectedPayment.id === "dlpay"
                  ? "Generate Payment Link"
                  : "Generate QR Code"}{" "}
              {!qrLoading && <FaQrcode />}
            </button>
            
            <button
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-md font-medium text-sm text-gray-700
                bg-gray-100 hover:bg-gray-200 transition-all"
              onClick={handleDebug}
              disabled={loading}
            >
              <FaBug /> Debug
            </button>
          </div>
        )}

        {/* DL PAY Section */}
        {dlPayUrl && (
          <div className="flex flex-col items-center my-2.5">
            <h2 className="text-lg font-medium mb-4 text-gray-800">DL PAY Payment</h2>
            <div className="bg-blue-50 p-2.5 rounded-lg mb-3 w-full">
              <p className="m-0 leading-relaxed text-sm">
                1. Click the button below to open the DL PAY payment page
                <br />
                2. Complete the payment of ${calculateTotal().toFixed(2)}
                <br />
                3. Return to this page after payment
                <br />
                4. The system will automatically verify your payment
              </p>
            </div>
            <div className="mb-4 font-medium text-sm">
              <span>Order ID: {orderId}</span>
              {dlPayTransactionId && <div className="mt-1 text-gray-600">Transaction ID: {dlPayTransactionId}</div>}
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-medium text-sm text-white
                  bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-500
                  transition-all"
                onClick={handleOpenDlPay}
              >
                Open DL PAY Payment Page <FaQrcode className="ml-1" />
              </button>
              <button
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-medium text-sm text-white
                  bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-r hover:from-green-700 hover:to-green-500
                  transition-all ${loading || checkingStatus ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={handleConfirmPayment}
                disabled={loading || checkingStatus}
              >
                {loading || checkingStatus ? "Verifying Payment..." : "I've Completed the Payment"}{" "}
                {!loading && !checkingStatus && <FaCheckCircle />}
              </button>
              
              <button
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm text-gray-700
                  bg-gray-100 hover:bg-gray-200 transition-all"
                onClick={handleDebug}
                disabled={loading}
              >
                <FaBug /> Debug Configuration
              </button>
            </div>
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
                3. Complete the payment of ${calculateTotal().toFixed(2)}
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
                transition-all w-full justify-center"
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
              ${loading || checkingStatus ? "opacity-70 cursor-not-allowed" : ""}`}
            onClick={onBack}
            disabled={loading || checkingStatus}
          >
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PaymentModal
