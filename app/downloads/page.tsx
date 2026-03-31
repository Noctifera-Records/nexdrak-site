import { redirect } from 'next/navigation'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import DownloadsGrid from './downloads-grid'
import { getDownloads } from './actions'

export default async function DownloadsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect('/login')
  }

  // Obtener descargas
  const downloads = await getDownloads();

  if (!downloads) {
    return (
      <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
        <h1 className="text-4xl font-bold mb-6 text-center text-foreground dark:text-white">DOWNLOADS</h1>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md mx-auto">
          <p className="text-destructive text-center">Error loading downloads or unauthorized</p>
        </div>
      </div>
    )
  }

  // Serialize dates
  const formattedDownloads = downloads.map((d: any) => ({
    ...d,
    created_at: d.created_at ? (typeof d.created_at === 'string' ? d.created_at : new Date(d.created_at).toISOString()) : null,
  }));

  // Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "NexDrak Exclusive Downloads",
    "description": "Producer tools, wallpapers, and exclusive content from NexDrak.",
    "itemListElement": formattedDownloads.map((d: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": d.title,
        "description": d.description,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "image": d.cover_image_url
      }
    }))
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground dark:text-white">EXCLUSIVE DOWNLOADS</h1>
          <p className="text-muted-foreground dark:text-gray-300 text-lg">
            Exclusive content for registered members
          </p>
          <p className="text-muted-foreground/80 dark:text-gray-400 text-sm mt-2">
            Wallpapers, instrumental music, and more free content
          </p>
        </div>

        <DownloadsGrid downloads={formattedDownloads} />
      </div>
    </div>
  )
}
