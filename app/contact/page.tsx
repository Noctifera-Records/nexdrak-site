import { Mail, MapPin, Phone, ExternalLink } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            CONNECT WITH NexDrak
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stay in the loop with our music releases, events, and behind-the-scenes content across all platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold border-b border-green-500/30 pb-2">Contact</h2>
            
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Email</h3>
                <div className="space-y-1 mt-2 text-gray-300">
                  <p>management@pulsemusic.com</p>
                  <p>booking@pulsemusic.com</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Phone</h3>
                <p className="mt-2 text-gray-300">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500 mt-1">Business Hours: 9AM-5PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold">HQ</h3>
                <address className="not-italic mt-2 text-gray-300">
                  123 Electronic Avenue<br />
                  Suite 405<br />
                  New York, NY 10001
                </address>
              </div>
            </div>
          </div>

          {/* Social Media & Links */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold border-b border-green-500/30 pb-2">Follow Us</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-green-500/20 hover:border-green-500 transition-all duration-300">
                <h3 className="font-bold text-xl mb-4 text-green-400">Social Platforms</h3>
                <div className="flex flex-wrap gap-4">
                  {['Instagram', 'Twitter', 'YouTube', 'Spotify', 'TikTok', 'Facebook'].map((platform) => (
                    <a 
                      key={platform}
                      href="#" 
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-400 hover:bg-green-500/20 transition-all duration-300 hover:scale-105"
                    >
                      {platform}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-green-500/20">
                <h3 className="font-bold text-xl mb-4 text-green-400">Links</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-green-400 hover:text-green-300">Artist Roster</a>
                  <a href="#" className="block text-green-400 hover:text-green-300">Press Kit</a>
                  <a href="#" className="block text-green-400 hover:text-green-300">Merch Store</a>
                  <a href="#" className="block text-green-400 hover:text-green-300">Event Calendar</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}