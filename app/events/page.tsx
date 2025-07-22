import { CalendarDays, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">UPCOMING EVENTS</h1>
        <p className="text-gray-300">
          Catch NexDrak live at venues around the world. Experience the immersive audio-visual journey in person.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.status === "sold-out" ? (
                  <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                    SOLD OUT
                  </Badge>
                ) : event.status === "cancelled" ? (
                  <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                    CANCELLED
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/50">
                    TICKETS AVAILABLE
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white" />
                <span>
                  {event.venue}, {event.location}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  event.status === "sold-out" || event.status === "cancelled"
                    ? "bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                    : "bg-white hover:bg-gray-200 text-black"
                }`}
                disabled={event.status === "sold-out" || event.status === "cancelled"}
              >
                {event.status === "sold-out" ? "SOLD OUT" : event.status === "cancelled" ? "CANCELLED" : "GET TICKETS"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
  )
}
