import { Instagram, Twitter, Youtube, Music, Facebook, TvMinimal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <Link href="https://www.instagram.com/nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <Instagram className="h-5 w-5 mr-2" />
            Instagram
          </span>
        </Button>
      </Link>

      <Link href="https://twitter.com/nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <Twitter className="h-5 w-5 mr-2" />
            Twitter
          </span>
        </Button>
      </Link>

      <Link href="https://www.youtube.com/@nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <Youtube className="h-5 w-5 mr-2" />
            YouTube
          </span>
        </Button>
      </Link>

      <Link href="https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <Music className="h-5 w-5 mr-2" />
            Spotify
          </span>
        </Button>
      </Link>

      <Link href="https://www.facebook.com/TheNexDrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <Facebook className="h-5 w-5 mr-2" />
            Facebook
          </span>
        </Button>
      </Link>

      <Link href="https://www.tiktok.com/@nexdrakofficial" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/20" asChild>
          <span>
            <TvMinimal className="h-5 w-5 mr-2" />
            TikTok
          </span>
        </Button>
      </Link>
    </div>
  )
}