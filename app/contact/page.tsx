import { Mail, MapPin, Globe, ExternalLink, MessageSquare } from "lucide-react"
import SocialLinks from "@/components/social-links"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
            Get in <span className="text-muted-foreground dark:text-white/40">Touch</span>
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto">
            For bookings, press inquiries, or just to say hello. Use the information below to connect with the NexDrak team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Contact Information */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2">Direct Contact</h2>
              
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Email</h3>
                    <div className="space-y-1 mt-1 text-lg font-medium">
                      <p className="hover:text-primary transition-colors"><a href="mailto:info@nexdrak.com">info@nexdrak.com</a></p>
                      <p className="text-sm text-muted-foreground">General Inquiries</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Booking & Management</h3>
                    <div className="space-y-1 mt-1 text-lg font-medium">
                      <p className="hover:text-primary transition-colors"><a href="mailto:mgmnt@nexdrak.com">mgmnt@nexdrak.com</a></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Location</h3>
                    <address className="not-italic mt-1 text-lg font-medium">
                      Mexico City, MX
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Quick Links */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2">Follow</h2>
              <div className="pt-6">
                <SocialLinks />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2">Resources</h2>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Link href="/press-kit" className="p-4 rounded-xl border border-border bg-card/50 hover:border-primary transition-all group">
                  <h3 className="font-bold text-sm uppercase group-hover:text-primary transition-colors">Press Kit</h3>
                  <p className="text-xs text-muted-foreground mt-1">Photos & Bio</p>
                </Link>
                <Link href="/music" className="p-4 rounded-xl border border-border bg-card/50 hover:border-primary transition-all group">
                  <h3 className="font-bold text-sm uppercase group-hover:text-primary transition-colors">Discography</h3>
                  <p className="text-xs text-muted-foreground mt-1">Full Releases</p>
                </Link>
                <Link href="/events" className="p-4 rounded-xl border border-border bg-card/50 hover:border-primary transition-all group">
                  <h3 className="font-bold text-sm uppercase group-hover:text-primary transition-colors">Tour Dates</h3>
                  <p className="text-xs text-muted-foreground mt-1">Live Shows</p>
                </Link>
                <Link href="/downloads" className="p-4 rounded-xl border border-border bg-card/50 hover:border-primary transition-all group">
                  <h3 className="font-bold text-sm uppercase group-hover:text-primary transition-colors">Exclusives</h3>
                  <p className="text-xs text-muted-foreground mt-1">Member Content</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-12 rounded-3xl bg-primary/5 border border-primary/10">
          <h2 className="text-2xl font-bold mb-4">Interested in Licensing?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            NexDrak music is available for film, games, and commercial projects. Get in touch with our licensing department.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <a href="mailto:licensing@nexdrak.com">Contact Licensing</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
