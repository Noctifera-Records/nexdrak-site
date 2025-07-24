"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "./loading-spinner"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubscribed(true)
      setEmail("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
        <div className="text-white text-2xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-4">THANKS FOR SUBSCRIBING!</h2>
        <p className="text-gray-300">
          You'll receive exclusive updates and early access to new releases.
        </p>
      </div>
    )
  }

  // return (
  //   <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-8">
  //     <h2 className="text-2xl font-bold mb-4 text-center">STAY UPDATED</h2>
  //     <p className="text-gray-300 mb-6 text-center">
  //       Subscribe to get exclusive updates, early access to tickets, and special offers
  //     </p>
  //     <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
  //       <input
  //         type="email"
  //         placeholder="Your email address"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //         className="flex-1 px-4 py-2 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400"
  //         required
  //         disabled={isLoading}
  //       />
  //       <Button 
  //         type="submit" 
  //         className="bg-white hover:bg-gray-200 text-black min-w-[120px]"
  //         disabled={isLoading}
  //       >
  //         {isLoading ? <LoadingSpinner size="sm" /> : "SUBSCRIBE"}
  //       </Button>
  //     </form>
  //     {error && (
  //       <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
  //     )}
  //   </div>
  // )
}
