import { Instagram, Twitter, Youtube, Music, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"

export const runtime = "edge";

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
        <Instagram className="h-5 w-5 mr-2" />
        Instagram
      </Button>
      <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
        <Twitter className="h-5 w-5 mr-2" />
        Twitter
      </Button>
      <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
        <Youtube className="h-5 w-5 mr-2" />
        YouTube
      </Button>
      <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
        <Music className="h-5 w-5 mr-2" />
        Spotify
      </Button>
      <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
        <Facebook className="h-5 w-5 mr-2" />
        Facebook
      </Button>
    </div>
  )
}
