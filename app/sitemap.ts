import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = 'https://nexdrak.com'

  // Fetch dynamic routes
  const { data: songs } = await supabase.from('songs').select('slug, created_at')
  const { data: events } = await supabase.from('events').select('id, created_at')
  
  const songUrls = songs?.map((song) => ({
    url: `${baseUrl}/music/${song.slug}`,
    lastModified: new Date(song.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) ?? []

  const eventUrls = events?.map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) ?? []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/music`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/merch`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...songUrls,
    ...eventUrls,
  ]
}