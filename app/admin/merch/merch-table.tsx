'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface MerchItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  purchase_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface MerchTableProps {
  items: MerchItem[];
  onEdit: (item: MerchItem) => void;
  onDelete: (id: number) => void;
}

export function MerchTable({ items, onEdit, onDelete }: MerchTableProps) {
  const [updatingAvailability, setUpdatingAvailability] = useState<number | null>(null);
  const supabase = createClient();

  const toggleAvailability = async (item: MerchItem) => {
    setUpdatingAvailability(item.id);
    
    try {
      const { error } = await supabase
        .from('merch')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating availability:', error);
        alert('Error al actualizar la disponibilidad');
        return;
      }

      // Update local state
      item.is_available = !item.is_available;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la disponibilidad');
    } finally {
      setUpdatingAvailability(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No hay productos de merchandise registrados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle>Productos ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Imagen</th>
                    <th className="text-left p-2">Producto</th>
                    <th className="text-left p-2">Precio</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2">
                        <div className="w-12 h-12 relative bg-gray-200 rounded">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-semibold">${item.price}</span>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{item.category}</Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAvailability(item)}
                          disabled={updatingAvailability === item.id}
                          className={item.is_available ? 'text-green-600' : 'text-red-600'}
                        >
                          {updatingAvailability === item.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : item.is_available ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="p-2 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={item.purchase_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Ver enlace de compra"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 relative bg-gray-200 rounded flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAvailability(item)}
                      disabled={updatingAvailability === item.id}
                      className={item.is_available ? 'text-green-600' : 'text-red-600'}
                    >
                      {updatingAvailability === item.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : item.is_available ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">${item.price}</span>
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    Creado: {formatDate(item.created_at)}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a 
                        href={item.purchase_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}