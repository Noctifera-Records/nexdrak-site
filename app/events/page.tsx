 

import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MapPin, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Upcoming Events | NexDrak',
  description: 'Catch NexDrak live at venues around the world.',
  alternates: { canonical: '/events' }
}

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
}

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: eventsData, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  const events: Event[] = error ? [] : (eventsData || []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">UPCOMING EVENTS</h1>
        <p className="text-gray-300">
          Catch NexDrak live at venues around the world. Experience the immersive audio-visual journey in person.
        </p>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: events.map((e, i) => ({
              "@type": "Event",
              position: i + 1,
              name: e.title,
              startDate: e.date,
              eventStatus: "https://schema.org/EventScheduled",
              location: e.location
                ? { "@type": "Place", name: e.location }
                : undefined,
              image: e.image_url || undefined,
              offers: e.ticket_url
                ? {
                    "@type": "Offer",
                    url: e.ticket_url,
                    availability: "https://schema.org/InStock",
                  }
                : undefined,
              description: e.description || undefined,
            })),
          }),
        }}
      />

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden group hover:border-white/40 transition-all">
              {/* Imagen del evento */}
              {event.image_url && (
                <div className="relative aspect-video bg-gray-800">
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {event.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-black">DESTACADO</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {event.ticket_url ? (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/50">
                      TICKETS AVAILABLE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                      INFO ONLY
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-white" />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                {event.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                )}
                
                {(event.venue || event.location) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white" />
                    <span>
                      {event.venue && event.location 
                        ? `${event.venue}, ${event.location}`
                        : event.venue || event.location
                      }
                    </span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                {event.ticket_url ? (
                  <Button
                    className="w-full bg-white hover:bg-gray-200 text-black"
                    asChild
                  >
                    <a 
                      href={event.ticket_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      GET TICKETS
                    </a>
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                    disabled
                  >
                    MORE INFO SOON
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hay eventos próximos programados</p>
          <p className="text-gray-500 text-sm">Los próximos eventos aparecerán aquí cuando se anuncien</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-16 p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">PRIVATE BOOKINGS</h2>
        <p className="text-gray-300 mb-6">
          Interested in booking NexDrak for a private event or festival? Get in touch with our booking team.
        </p>
        <a href="mailto:mgmt@nexdrak.com?subject=Private%20Booking%20Inquiry" className="block w-full">
          <Button className="bg-white hover:bg-gray-200 text-black">CONTACT FOR BOOKING</Button>
        </a>
      </div>
    </div>
  );
}
