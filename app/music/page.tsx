'use client';

import { Play, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Track {
  id: number;
  title: string;
  album: string;
  duration: string;
  releaseDate: string;
}

interface Album {
  id: number;
  title: string;
  year: string;
  trackCount: number;
  image: string;
  tracks: Track[];
}

const albums: Album[] = [
  {
    id: 1,
    title: "Digital Dreams",
    year: "2024",
    trackCount: 8,
    image: "/placeholder.svg?height=400&width=400",
    tracks: [
      { id: 1, title: "Digital Awakening", album: "Digital Dreams", duration: "3:45", releaseDate: "2024-03-15" },
      { id: 2, title: "Neon Pulse", album: "Digital Dreams", duration: "4:12", releaseDate: "2024-03-15" },
      { id: 3, title: "Synthetic Emotions", album: "Digital Dreams", duration: "5:30", releaseDate: "2024-03-15" },
      { id: 4, title: "Binary Sunset", album: "Digital Dreams", duration: "4:55", releaseDate: "2024-03-15" },
      { id: 5, title: "Electric Dreams", album: "Digital Dreams", duration: "3:22", releaseDate: "2024-03-15" },
      { id: 6, title: "Quantum Leap", album: "Digital Dreams", duration: "6:10", releaseDate: "2024-03-15" },
      { id: 7, title: "Virtual Reality", album: "Digital Dreams", duration: "4:48", releaseDate: "2024-03-15" },
      { id: 8, title: "Digital Horizon", album: "Digital Dreams", duration: "7:15", releaseDate: "2024-03-15" },
    ],
  },
  {
    id: 2,
    title: "Synth Horizon",
    year: "2023",
    trackCount: 6,
    image: "/placeholder.svg?height=400&width=400",
    tracks: [
      { id: 9, title: "Horizon Line", album: "Synth Horizon", duration: "4:20", releaseDate: "2023-08-10" },
      { id: 10, title: "Synth Wave", album: "Synth Horizon", duration: "3:55", releaseDate: "2023-08-10" },
      { id: 11, title: "Analog Dreams", album: "Synth Horizon", duration: "5:15", releaseDate: "2023-08-10" },
      { id: 12, title: "Future Past", album: "Synth Horizon", duration: "4:30", releaseDate: "2023-08-10" },
      { id: 13, title: "Retro Future", album: "Synth Horizon", duration: "3:45", releaseDate: "2023-08-10" },
      { id: 14, title: "Neon Nights", album: "Synth Horizon", duration: "6:05", releaseDate: "2023-08-10" },
    ],
  },
];

const singles: Track[] = [
  { id: 15, title: "Midnight Drive", album: "Single", duration: "3:35", releaseDate: "2024-04-20" },
  { id: 16, title: "Cyber Dawn", album: "Single", duration: "4:15", releaseDate: "2024-02-15" },
  { id: 17, title: "Electric Soul", album: "Single", duration: "3:50", releaseDate: "2023-12-01" },
  { id: 18, title: "Digital Love", album: "Single", duration: "4:25", releaseDate: "2023-10-12" },
];

export default function MusicPage() {
  const handleShareAlbum = async (album: Album) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Escucha el álbum ${album.title} de NexDrak!`,
          text: `Descubre las increíbles pistas del álbum ${album.title} (${album.year}).`,
          url: window.location.href, // Puedes personalizar la URL si tienes una específica para cada álbum
        });
        console.log("¡Álbum compartido exitosamente!");
      } catch (error) {
        console.log("Error al compartir el álbum", error);
      }
    } else {
      alert("La función de compartir no está disponible en este navegador.");
      // Aquí podrías implementar una alternativa como copiar el enlace al portapapeles
    }
  };

  const handleShareSingle = async (single: Track) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Escucha el sencillo ${single.title} de NexDrak!`,
          text: `Disfruta del sencillo ${single.title}.`,
          url: window.location.href, // Puedes personalizar la URL si tienes una específica para cada sencillo
        });
        console.log("¡Sencillo compartido exitosamente!");
      } catch (error) {
        console.log("Error al compartir el sencillo", error);
      }
    } else {
      alert("La función de compartir no está disponible en este navegador.");
      // Aquí podrías implementar una alternativa como copiar el enlace al portapapeles
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
        <p className="text-gray-300">Explore NexDrak's discography, from albums to singles and remixes.</p>
      </div>

      <Tabs defaultValue="albums" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="singles">Singles</TabsTrigger>
          <TabsTrigger value="remixes">Remixes</TabsTrigger>
        </TabsList>

        <TabsContent value="albums" className="space-y-12">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden"
            >
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                <div className="aspect-square relative bg-black/30 max-w-[300px] mx-auto md:mx-0">
                  <img
                    src={album.image || "/placeholder.svg"}
                    alt={album.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">{album.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>{album.year}</span>
                      <span>•</span>
                      <span>{album.trackCount} tracks</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button className="bg-green-500 hover:bg-green-600 text-black">
                        <Play className="h-4 w-4 mr-2" />
                        Play All
                      </Button>
                      <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                        <Download className="h-4 w-4 mr-2" />
                        Get Wallpaper
                      </Button>
                      <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                        <Download className="h-4 w-4 mr-2" />
                        Download MP3
                      </Button>
                      <Button
                        variant="outline"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                        onClick={() => handleShareAlbum(album)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {album.tracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between py-2 px-3 hover:bg-green-500/10 rounded-md group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 w-6 text-center">{index + 1}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <Play className="h-4 w-4" />
                          </Button>
                          <span>{track.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">{track.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="singles">
          <Card className="bg-black/50 backdrop-blur-sm border-green-500/20">
            <CardHeader>
              <CardTitle>Singles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {singles.map((single) => (
                  <div
                    key={single.id}
                    className="flex items-center justify-between py-2 px-3 hover:bg-green-500/10 rounded-md group"
                  >
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <Play className="h-4 w-4" />
                      </Button>
                      <div>
                        <div>{single.title}</div>
                        <div className="text-xs text-gray-500">
                          Released: {new Date(single.releaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{single.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handleShareSingle(single)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-500 hover:bg-green-600 text-black w-full">
                <Play className="h-4 w-4 mr-2" />
                Play All Singles
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="remixes">
          <div className="text-center py-12">
            <h3 className="text-xl mb-4">Remixes Coming Soon</h3>
            <p className="text-gray-400">Stay tuned for upcoming remix collaborations with other artists.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="max-w-2xl mx-auto mt-16 p-8 bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">LICENSING</h2>
        <p className="text-gray-300 mb-6">
          Interested in licensing NexDrak's music for your project, film, or commercial? Get in touch with our licensing
          team.
        </p>
        <Button className="bg-green-500 hover:bg-green-600 text-black">CONTACT FOR LICENSING</Button>
      </div>
    </div>
  );
}