'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit, Trash2, ExternalLink, Calendar, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  venue?: string;
  ticket_url?: string;
  image_url?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface EventsTableProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
}

export function EventsTable({ events, onEdit, onDelete }: EventsTableProps) {
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [updatingFeatured, setUpdatingFeatured] = useState<number | null>(null);
  const supabase = createClient();

  const togglePublished = async (event: Event) => {
    setUpdatingStatus(event.id);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !event.is_published })
        .eq('id', event.id);

      if (error) {
        console.error('Error updating published status:', error);
        alert('Error al actualizar el estado');
        return;
      }

      // Update local state
      event.is_published = !event.is_published;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleFeatured = async (event: Event) => {
    setUpdatingFeatured(event.id);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_featured: !event.is_featured })
        .eq('id', event.id);

      if (error) {
        console.error('Error updating featured status:', error);
        alert('Error al actualizar el estado destacado');
        return;
      }

      // Update local state
      event.is_featured = !event.is_featured;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado destacado');
    } finally {
      setUpdatingFeatured(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay eventos registrados.</p>
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
            <CardTitle>Eventos ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Imagen</th>
                    <th className="text-left p-2">Evento</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Ubicación</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2">
                        <div className="w-12 h-12 relative bg-gray-200 rounded">
                          {event.image_url ? (
                            <Image
                              src={event.image_url}
                              alt={event.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Calendar className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          {event.venue && (
                            <p className="text-sm text-gray-500">{event.venue}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="text-sm">{formatDate(event.date)}</p>
                          {event.time && (
                            <p className="text-xs text-gray-500">{formatTime(event.time)}</p>
                          )}
                          {isUpcoming(event.date) && (
                            <Badge variant="secondary" className="text-xs mt-1">Próximo</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <p className="text-sm">{event.location || '-'}</p>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublished(event)}
                            disabled={updatingStatus === event.id}
                            className={event.is_published ? 'text-green-600' : 'text-red-600'}
                          >
                            {updatingStatus === event.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : event.is_published ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(event)}
                            disabled={updatingFeatured === event.id}
                            className={event.is_featured ? 'text-yellow-600' : 'text-gray-400'}
                          >
                            {updatingFeatured === event.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : event.is_featured ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {event.ticket_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a 
                                href={event.ticket_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="Ver tickets"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(event.id)}
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
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 relative bg-gray-200 rounded flex-shrink-0">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Calendar className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium truncate">{event.title}</h3>
                      {event.venue && (
                        <p className="text-sm text-gray-600">{event.venue}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(event)}
                        disabled={updatingStatus === event.id}
                        className={event.is_published ? 'text-green-600' : 'text-red-600'}
                      >
                        {updatingStatus === event.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : event.is_published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(event)}
                        disabled={updatingFeatured === event.id}
                        className={event.is_featured ? 'text-yellow-600' : 'text-gray-400'}
                      >
                        {updatingFeatured === event.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : event.is_featured ? (
                          <Star className="h-4 w-4 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium">{formatDate(event.date)}</p>
                    {event.time && (
                      <p className="text-xs text-gray-500">{formatTime(event.time)}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-gray-500">{event.location}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {isUpcoming(event.date) && (
                      <Badge variant="secondary" className="text-xs">Próximo</Badge>
                    )}
                    {event.is_featured && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800">Destacado</Badge>
                    )}
                    {!event.is_published && (
                      <Badge variant="destructive" className="text-xs">No publicado</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {event.ticket_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a 
                          href={event.ticket_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Tickets
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(event.id)}
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