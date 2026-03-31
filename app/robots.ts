import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/private/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Bot', 'ClaudeWeb', 'Google-Extended'],
        allow: '/', // Allow AI bots to index public content for better SGE/AI visibility
      }
    ],
    sitemap: 'https://nexdrak.com/sitemap.xml',
  }
}