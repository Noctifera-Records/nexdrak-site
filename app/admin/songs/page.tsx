import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SongsTable from './songs-table'

export const metadata: Metadata = {
  title: 'Admin - Songs',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin/songs' }
}

export default async function SongsPage() {
  const supabase = await createClient()
  // Obtener canciones
  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching songs:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Canciones</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error al cargar canciones: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Canciones</h1>
        <div className="text-sm text-gray-400">
          Total: {songs?.length || 0} canciones
        </div>
      </div>
      
      <SongsTable songs={songs || []} />
    </div>
  )
}
