"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "./loading-spinner"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (err) {
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
        <div className="text-white text-3xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-4">MESSAGE SENT!</h2>
        <p className="text-gray-300 mb-6">
          Thanks for reaching out. I'll get back to you as soon as possible.
        </p>
        <Button 
          onClick={() => setIsSubmitted(false)}
          className="bg-white hover:bg-gray-200 text-black"
        >
          SEND ANOTHER MESSAGE
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">GET IN TOUCH</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="px-4 py-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400"
            required
            disabled={isLoading}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="px-4 py-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400"
            required
            disabled={isLoading}
          />
        </div>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400"
          required
          disabled={isLoading}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400 resize-none"
          required
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="w-full bg-white hover:bg-gray-200 text-black py-3"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "SEND MESSAGE"}
        </Button>
      </form>
      {error && (
        <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
      )}
    </div>
  )
}