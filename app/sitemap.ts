import { MetadataRoute } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://nexdrak.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/music`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/merch`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/press-kit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/tos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const supabase = createServiceRoleClient()
  if (!supabase) return staticPages

  try {
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('slug, updated_at, created_at')

    if (songsError || !songs || songs.length === 0) {
      return staticPages
    }

    const songUrls: MetadataRoute.Sitemap = (songs as Array<Record<string, any>>)
      .filter((song) => song?.slug)
      .map((song) => ({
        url: `${baseUrl}/${song.slug}`,
        lastModified: new Date(song.updated_at || song.created_at || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))

    return [...staticPages, ...songUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
