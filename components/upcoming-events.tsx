import { CalendarDays, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const runtime = "edge";

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  venue: string
  status: "upcoming" | "sold-out" | "cancelled"
}

const events: Event[] = [
  {
    id: 1,
    title: "PULSE Live at Techno Sphere",
    date: "June 15, 2025",
    time: "10:00 PM - 2:00 AM",
    location: "Berlin, Germany",
    venue: "Techno Sphere Club",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Electronic Fusion Festival",
    date: "July 8, 2025",
    time: "8:00 PM - 6:00 AM",
    location: "Amsterdam, Netherlands",
    venue: "Fusion Arena",
    status: "upcoming",
  },
  {
    id: 3,
    title: "PULSE Summer Tour - London",
    date: "July 22, 2025",
    time: "9:00 PM - 3:00 AM",
    location: "London, UK",
    venue: "Electric Warehouse",
    status: "upcoming",
  },
  {
    id: 4,
    title: "Digital Dreams Festival",
    date: "August 5, 2025",
    time: "7:00 PM - 4:00 AM",
    location: "Barcelona, Spain",
    venue: "Beachfront Stage",
    status: "upcoming",
  },
  {
    id: 5,
    title: "PULSE at Neon Nights",
    date: "August 19, 2025",
    time: "11:00 PM - 5:00 AM",
    location: "Tokyo, Japan",
    venue: "Neon Club Tokyo",
    status: "sold-out",
  },
  {
    id: 6,
    title: "Electronic Horizons",
    date: "September 3, 2025",
    time: "10:00 PM - 4:00 AM",
    location: "New York, USA",
    venue: "Horizon Hall",
    status: "upcoming",
  },
]

interface UpcomingEventsProps {
  limit?: number
}

export default function UpcomingEvents({ limit }: UpcomingEventsProps) {
  const displayEvents = limit ? events.slice(0, limit) : events

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayEvents.map((event) => (
        <Card key={event.id} className="bg-black/50 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{event.title}</h3>
              {event.status === "sold-out" ? (
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                  SOLD OUT
                </Badge>
              ) : event.status === "cancelled" ? (
                <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                  CANCELLED
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                  TICKETS AVAILABLE
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-500" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>
                  {event.venue}, {event.location}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0">
            <Button
              className={`w-full ${
                event.status === "sold-out" || event.status === "cancelled"
                  ? "bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-black"
              }`}
              disabled={event.status === "sold-out" || event.status === "cancelled"}
            >
              {event.status === "sold-out" ? "SOLD OUT" : event.status === "cancelled" ? "CANCELLED" : "GET TICKETS"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
