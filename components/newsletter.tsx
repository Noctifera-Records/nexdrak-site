import { Button } from "@/components/ui/button"

export const runtime = "edge";

export default function Newsletter() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">JOIN THE PULSE COMMUNITY</h2>
      <p className="text-gray-300 mb-6 text-center">
        Subscribe to get exclusive updates, early access to tickets, and special offers
      </p>
      <form className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 px-4 py-2 bg-black/50 border border-green-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <Button type="submit" className="bg-green-500 hover:bg-green-600 text-black">
          SUBSCRIBE
        </Button>
      </form>
    </div>
  )
}
