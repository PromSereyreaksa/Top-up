"use client"

import { useState, useEffect } from "react"
import { FaCheckCircle, FaHome, FaGamepad } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const ConfirmationModal = ({ isOpen, onClose, onDone }) => {
  const { orderDetails, resetOrder } = useGameContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    if (!orderDetails || !isOpen) return

    const checkOrderStatus = async () => {
      try {
        setLoading(true)
        // In a real app, you would check the order status from the API
        // For now, we'll simulate a successful order
        setTimeout(() => {
          setOrderStatus({
            status: "completed",
            message: "Your payment has been confirmed and the top-up has been processed successfully.",
            transactionId: "TXN" + Math.floor(Math.random() * 1000000),
          })
          setLoading(false)
        }, 2000)
      } catch (err) {
        setError("Failed to check order status. Please contact support.")
        setLoading(false)
      }
    }

    checkOrderStatus()
  }, [orderDetails, isOpen])

  const handleDone = () => {
    resetOrder()
    onDone()
  }

  const handleNewTopUp = () => {
    resetOrder()
    onDone()
    // You could add logic here to restart the top-up flow
  }

  if (!orderDetails) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Top-Up Confirmation" size="medium">
      <div className="py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-5">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-sky-400 rounded-full animate-spin mb-5"></div>
            <h2 className="text-xl text-gray-800 mb-2">Processing your order...</h2>
            <p className="text-gray-500 text-center">Please wait while we confirm your payment and process your top-up.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-5">
            <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-5">!</div>
            <h2 className="text-xl text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-center mb-5">{error}</p>
            <div className="flex justify-center">
              <button 
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-800 rounded-md font-medium transition-all hover:bg-gray-200"
                onClick={handleDone}
              >
                <FaHome /> Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-5xl text-green-600 mb-4">
              <FaCheckCircle />
            </div>
            <h2 className="text-2xl text-gray-800 mb-2">Top-Up Successful!</h2>
            <p className="text-gray-500 text-center mb-5">{orderStatus.message}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-5 w-full text-left">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-500">Order ID:</span>
                <span className="font-semibold">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-500">Transaction ID:</span>
                <span className="font-semibold">{orderStatus.transactionId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-500">Game:</span>
                <span className="font-semibold">{orderDetails.gameId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-500">Package:</span>
                <span className="font-semibold">
                  {orderDetails.amount} {orderDetails.currency}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-500">Game ID:</span>
                <span className="font-semibold">{orderDetails.userId}</span>
              </div>
              {orderDetails.serverId && (
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-500">Server ID:</span>
                  <span className="font-semibold">{orderDetails.serverId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Amount Paid:</span>
                <span className="font-semibold">${orderDetails.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-gray-500 text-center text-sm leading-relaxed">
                Your game account has been topped up successfully. The credits should be reflected in your game account
                immediately. If you don't see the credits in your account within 5 minutes, please contact our support
                team.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-800 rounded-md font-medium transition-all hover:bg-gray-200"
                onClick={handleDone}
              >
                <FaHome /> Done
              </button>
              <button 
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-md font-medium transition-all hover:bg-gradient-to-r hover:from-blue-600 hover:to-sky-400"
                onClick={handleNewTopUp}
              >
                <FaGamepad /> New Top-Up
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ConfirmationModal