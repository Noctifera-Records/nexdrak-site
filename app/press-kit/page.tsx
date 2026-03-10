import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Press Kit",
  description: "Official press kit, biography, logos, and promotional assets for NexDrak.",
};

export default function PressKitPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl space-y-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Press Kit</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Official resources for media, promoters, and collaborators.
        </p>
      </section>

      {/* Biography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Biography</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            NexDrak is an electronic music producer known for blending atmospheric soundscapes with high-energy beats. 
            With a unique approach to sound design, NexDrak creates immersive auditory experiences that resonate with 
            listeners worldwide.
          </p>
          <p>
            Since debuting, NexDrak has focused on pushing the boundaries of the genre, incorporating elements of 
            ambient, techno, and experimental electronica. Each release tells a story, inviting the audience on a 
            sonic journey.
          </p>
        </div>
      </section>

      {/* Assets Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logos Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Logos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative bg-muted rounded-lg flex items-center justify-center p-8">
                {/* Placeholder for Logo Preview */}
                <div className="text-center space-y-2">
                  <div className="font-bold text-2xl">NEXDRAK</div>
                  <div className="text-xs text-muted-foreground">Vector & PNG formats</div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/assets/nexdrak-logos.zip" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Logo Pack
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Photos Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Promotional Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                {/* Placeholder for Photo Preview */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
                  <Image 
                    src="/img/logo.png" 
                    alt="NexDrak Promo" 
                    width={400} 
                    height={400} 
                    className="opacity-50 object-cover"
                  />
                </div>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/assets/nexdrak-photos.zip" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Hi-Res Photos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Contact</h2>
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-lg">Booking & Inquiries</h3>
              <p className="text-muted-foreground">
                For press features, interviews, or booking requests.
              </p>
            </div>
            <Button size="lg" asChild>
              <a href="mailto:contact@nexdrak.com">
                <Mail className="mr-2 h-4 w-4" />
                contact@nexdrak.com
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
