import Image from "next/image"
import { Instagram, Twitter, Youtube, AirplayIcon as Spotify, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ABOUT NEXDRAK</h1>
        <p className="text-gray-300">The story, vision, and journey of the artist.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">THE ARTIST</h2>
          <div className="space-y-4 text-gray-300">
            <p>
            NexDrak aka. “Nex” emerged from the underground electronic scene in 2017, setting 
            a standard back then for the composition of immersive and cutting-edge new styles that combine hypnotic visuals.
            </p>
            <p>
            Drawing inspiration from a wide range of influences, from classic experimental, ambient to punchier beats like Dubstep, DNB and ultimately Mid-Tempo and Riddim. 
            NexDrak creates soundscapes that transport listeners to strange futuristic realms, hopefully this man doesn't know what hope means.
            </p>
            <p>
            With each release and performance, Nex continues to push the boundaries of music or at least tries to, 
            exploring the intersection of technology and human emotion through sound.
            </p>
          </div>
        </div>
        <div className="relative aspect-square select-none pointer-events-none">
          <Image
            src="/img/others/xayah.jpg"
            alt="NexDrak Artist Photo"
            fill
            className="object-cover rounded-xl"
            draggable={false}
            priority
          />
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">MUSICAL JOURNEY</h2>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2014</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Beginnings </h3>
              <p className="text-gray-300">
              Start creating remixes and edits of several Vocaloid (CircusP) songs like “iNFeCTioN” and “Thunder Storm”.  
              Previously adopted the name PowerDark but this was changed for being too little “imposing” in his opinion.
              That same year he released his first single on SoundCloud under the name “Sky Bridge”.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2015</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Start on YouTube</h3>
              <p className="text-gray-300">
              In this year he created his music channel and resubmitted many of his songs on this channel and formally adopted the name “NexDrak”, 
              in this year he released “Loop Lovely” and “DownFall” laying the foundations of his musical genre, but let's not forget some 
              very disastrous tracks that we prefer not to mention.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2017</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Beat Basis</h3>
              <p className="text-gray-300">
                In this year he managed to consolidate himself as an emotive principle with tracks like “Your Smile” and “Time Out”.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2018</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Growth</h3>
              <p className="text-gray-300">
                Thanks to his singles like “Even to Dream” and “Akai” he positioned himself as a reference in the London Dubstep community.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2020</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Live Showcase</h3>
              <p className="text-gray-300">
              In 2020 he made his first presentation in CDMX, with the support of The Chainsmokers, this presentation was not as disastrous as he expected, 
              this same year he made his second event in the bar “Pan y Circo”, creating a more solid audience. 
              This same year he released his first EP called “Your Lie” a little different to his established style.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 flex flex-col items-center md:items-end">
              <div className="text-white font-bold text-xl">2018 - Present</div>
              <div className="h-full w-px bg-white/30 my-2 hidden md:block"></div>
            </div>
            <div className="md:w-3/4 bg-black/30 p-6 rounded-lg border border-white/10">
              <h3 className="font-bold mb-2">Fall, The future and The road</h3>
              <p className="text-gray-300">
                At this stage the pandemic played an important challenge in his career, from here on his releases were more inconsistent, 
                releasing one per year among them “Rewind” a reflection to his future. 
                He still has no proposed plans for his future as an artist but he believes that taking a step forward is better than standing still.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl font-bold mb-4 text-white">LIVE EXPERIENCE</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              A NexDrak live performance is more than just music: it's a fully immersive sensory journey. 
            </p>
            <p>
              Each show is unique, with custom-designed visuals that respond in real time to the music, creating a symbiotic relationship between sound and sight.
            </p>
            <p>
              symbiotic relationship between sound and sight that envelops the audience in creative vision, we know your career as a computer scientist helps.
            </p>
          </div>
        </div>
        <div className="relative aspect-video order-1 md:order-2">
          <Image
            src="img/live_experience.png"
            alt="NexDrak Live Performance"
            fill
            className="object-cover rounded-xl"
            draggable={false}
          />
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold mb-6">CONNECT WITH PULSE</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
            <Instagram className="h-5 w-5 mr-2" />
            Instagram
          </Button>
          <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
            <Twitter className="h-5 w-5 mr-2" />
            Twitter
          </Button>
          <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
            <Youtube className="h-5 w-5 mr-2" />
            YouTube
          </Button>
          <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
            <Spotify className="h-5 w-5 mr-2" />
            Spotify
          </Button>
          <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
            <Facebook className="h-5 w-5 mr-2" />
            Facebook
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">CONTACT</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left mb-6">
          <div>
            <h3 className="font-bold mb-2">Management</h3>
            <p className="text-gray-300">mgmnt@nexdrak.com</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Press</h3>
            <p className="text-gray-300">press@nexdrak.com</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">General Inquiries</h3>
            <p className="text-gray-300">info@nexdrak.com</p>
          </div>
        </div>
        <Button className="bg-white hover:bg-gray-200 text-black">CONTACT FORM</Button>
      </div>
    </div>
  )
}
