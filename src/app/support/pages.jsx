"use client"

import { useState } from "react"
import { FaPaperPlane, FaPhone, FaEnvelope, FaComments } from "react-icons/fa"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real app, you would submit the form to the API
      // For now, we'll simulate a successful submission
      setTimeout(() => {
        setSuccess(true)
        setLoading(false)
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      }, 1500)
    } catch (err) {
      setError("Failed to submit your request. Please try again later.")
      setLoading(false)
    }
  }

  return (
    <div className="py-10 px-5" id="support">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Customer Support</h1>
          <p className="text-lg text-gray-600">We're here to help! Fill out the form below or contact us directly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Contact Information</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center text-lg">
                  <FaPhone />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1 text-gray-900">Phone</h3>
                  <p className="text-gray-600 m-0 leading-relaxed">+855 12 345 678</p>
                  <p className="text-gray-600 m-0 leading-relaxed">Mon-Fri: 9AM - 6PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center text-lg">
                  <FaEnvelope />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1 text-gray-900">Email</h3>
                  <p className="text-gray-600 m-0 leading-relaxed">coppsary@gmail.com</p>
                  <p className="text-gray-600 m-0 leading-relaxed">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center text-lg">
                  <FaComments />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1 text-gray-900">Live Chat</h3>
                  <p className="text-gray-600 m-0 leading-relaxed">Available on our website</p>
                  <p className="text-gray-600 m-0 leading-relaxed">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 md:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Send Us a Message</h2>

            {success ? (
              <div className="text-center py-8 bg-green-50 rounded-lg">
                <FaPaperPlane className="text-5xl text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-green-700">Message Sent Successfully!</h3>
                <p className="text-gray-600">Your message is received. We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-center">{error}</div>}

                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                </div>

                <div className="mb-5">
                  <label htmlFor="subject" className="block mb-2 font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.subject && <div className="text-red-500 text-sm mt-1">{errors.subject}</div>}
                </div>

                <div className="mb-5">
                  <label htmlFor="message" className="block mb-2 font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                  ></textarea>
                  {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium transition-all hover:from-blue-600 hover:to-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"} {!loading && <FaPaperPlane />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
