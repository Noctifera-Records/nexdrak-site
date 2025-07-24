"use client";

import { useState, useEffect } from "react";
import { CalendarDays, MapPin, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string | null;
  ticket_url: string | null;
  created_at: string;
}

interface UpcomingEventsProps {
  limit?: number;
}

export default function UpcomingEvents({ limit }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(limit || 10);

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        setEvents(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [supabase, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 3)].map((_, i) => (
          <Card
            key={i}
            className="bg-black/50 backdrop-blur-sm border-white/20"
          >
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-gray-700 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
              <div className="h-10 bg-gray-700 rounded animate-pulse w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No upcoming events</p>
        <p className="text-gray-500 text-sm">
          Upcoming events will appear here as they are scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="bg-black/50 backdrop-blur-sm border-white/20"
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{event.title}</h3>
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-300 border-blue-500/50"
              >
                NEXT
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0">
            {event.ticket_url ? (
              <Button
                className="w-full bg-white hover:bg-gray-200 text-black"
                asChild
              >
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  BUY TICKETS
                </a>
              </Button>
            ) : (
              <Button
                className="w-full bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                disabled
              >
                COMING SOON
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
