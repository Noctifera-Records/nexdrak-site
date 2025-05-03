import { Mail, MapPin, Phone } from "lucide-react"
import ContactForm from "@/components/contact-form"

export const runtime = "edge";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">CONTACT</h1>
        <p className="text-gray-300">
          Get in touch with the PULSE team for bookings, press inquiries, or just to say hello.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          <ContactForm />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

          <div className="space-y-8 mb-12">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <div className="space-y-1 mt-2">
                  <p>Management: management@pulsemusic.com</p>
                  <p>Booking: booking@pulsemusic.com</p>
                  <p>Press: press@pulsemusic.com</p>
                  <p>General: info@pulsemusic.com</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-bold text-lg">Phone</h3>
                <p className="mt-2">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-400 mt-1">Monday-Friday, 9AM-5PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-bold text-lg">Office</h3>
                <address className="not-italic mt-2">
                  PULSE Music
                  <br />
                  123 Electronic Avenue
                  <br />
                  Suite 405
                  <br />
                  New York, NY 10001
                </address>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3">Follow Us</h3>
            <p className="text-gray-300 mb-4">
              Stay connected with PULSE on social media for the latest updates, behind-the-scenes content, and exclusive
              announcements.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="text-green-500 hover:text-green-400">
                Instagram
              </a>
              <span className="text-gray-500">•</span>
              <a href="#" className="text-green-500 hover:text-green-400">
                Twitter
              </a>
              <span className="text-gray-500">•</span>
              <a href="#" className="text-green-500 hover:text-green-400">
                YouTube
              </a>
              <span className="text-gray-500">•</span>
              <a href="#" className="text-green-500 hover:text-green-400">
                Spotify
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
