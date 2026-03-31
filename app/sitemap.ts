import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = 'https://nexdrak.com'

  // Fetch dynamic routes
  // Note: Using client in server component might need service role if RLS is enabled, 
  // but for public sitemap we assume public access works or we'd use service role.
  const { data: songs } = await supabase.from('songs').select('slug, updated_at, created_at')
  const { data: events } = await supabase.from('events').select('id, updated_at, created_at')
  
  const songUrls = songs?.map((song) => ({
    url: `${baseUrl}/${song.slug}`,
    lastModified: new Date(song.updated_at || song.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) ?? []

  const eventUrls = events?.map((event) => ({
    url: `${baseUrl}/events`, // Since events are listed on one page mostly, but if we had /events/[id] we'd use it
    lastModified: new Date(event.updated_at || event.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) ?? []

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/music`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/merch`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/downloads`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/press-kit`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  return [
    ...staticPages,
    ...songUrls,
  ]
}