import { createClient } from '@/lib/supabase/server'
import ReleasesTable from './releases-table'

export default async function ReleasesPage() {
  const supabase = await createClient()
  
  // Obtener releases
  const { data: releases, error } = await supabase
    .from('releases')
    .select('*')
    .order('release_date', { ascending: false })

  if (error) {
    console.error('Error fetching releases:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Lanzamientos</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error al cargar lanzamientos: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Lanzamientos</h1>
        <div className="text-sm text-gray-400">
          Total: {releases?.length || 0} lanzamientos
        </div>
      </div>
      
      <ReleasesTable releases={releases || []} />
    </div>
  )
}