import { createClient } from '@/lib/supabase/server'
import DownloadsTable from './downloads-table'



export default async function AdminDownloadsPage() {
  const supabase = await createClient()
  
  // Obtener todas las descargas (incluyendo inactivas para admin)
  const { data: downloads, error } = await supabase
    .from('downloads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching downloads:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Descargas</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error al cargar descargas: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Descargas</h1>
          <p className="text-gray-400 text-sm mt-1">
            Contenido exclusivo para usuarios registrados
          </p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {downloads?.length || 0} descargas
        </div>
      </div>
      
      <DownloadsTable downloads={downloads || []} />
    </div>
  )
}