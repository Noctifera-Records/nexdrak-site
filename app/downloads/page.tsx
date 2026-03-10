import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DownloadsGrid from './downloads-grid'



export default async function DownloadsPage() {
  const supabase = await createClient()
  
  // Verificar si el usuario está autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?')
  }

  // Obtener descargas
  const { data: downloads, error } = await supabase
    .from('downloads')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching downloads:', error)
    return (
      <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
        <h1 className="text-4xl font-bold mb-6 text-center text-foreground dark:text-white">DOWNLOADS</h1>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md mx-auto">
          <p className="text-destructive text-center">Error loading downloads</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
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

        <DownloadsGrid downloads={downloads || []} />
      </div>
    </div>
  )
}