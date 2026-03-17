import { Instagram, Twitter, Youtube, Music, Facebook, TvMinimal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <Link href="https://www.instagram.com/nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <Instagram className="h-5 w-5 mr-2" />
            Instagram
          </span>
        </Button>
      </Link>

      <Link href="https://x.com/nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <Twitter className="h-5 w-5 mr-2" />
            Twitter
          </span>
        </Button>
      </Link>

      <Link href="https://www.youtube.com/@nexdrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <Youtube className="h-5 w-5 mr-2" />
            YouTube
          </span>
        </Button>
      </Link>

      <Link href="https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <Music className="h-5 w-5 mr-2" />
            Spotify
          </span>
        </Button>
      </Link>

      <Link href="https://www.facebook.com/TheNexDrak" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <Facebook className="h-5 w-5 mr-2" />
            Facebook
          </span>
        </Button>
      </Link>

      <Link href="https://www.tiktok.com/@nexdrakofficial" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="lg" className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 transition-colors" asChild>
          <span>
            <TvMinimal className="h-5 w-5 mr-2" />
            TikTok
          </span>
        </Button>
      </Link>
    </div>
  )
}