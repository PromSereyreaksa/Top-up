"use client"

import React from "react"
import Link from "next/link"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong.</h2>
          <p className="text-gray-600 mb-4">
            We apologize for the inconvenience. Please try refreshing the page or navigate back to the home page.
          </p>
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer text-blue-500 hover:text-blue-700">Error details</summary>
            <div className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-wrap">
              <p className="text-red-500">{this.state.error && this.state.error.toString()}</p>
              <p className="mt-2 font-medium">Component Stack:</p>
              <pre className="mt-1 text-xs overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <Link href="/">
            <button className="mt-5 px-5 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300">
              Go to Home Page
            </button>
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
