'use client';

import { Play, Download, Share2, ImageDown } from "lucide-react";
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
    title: "Red Eye Flight",
    year: "2025",
    trackCount: 1,
    image: "/img/releases/rede.webp",
    tracks: [
      { id: 1, title: "Red Eye Flight", album: "Red Eye Flight", duration: "3:56", releaseDate: "2025-03-09" },
    ],
  },
  {
    id: 2,
    title: "Endless Rail",
    year: "2023",
    trackCount: 1,
    image: "/img/releases/endless.webp",
    tracks: [
      { id: 2, title: "Endless Rail", album: "Endless Rail", duration: "3:38", releaseDate: "2023-08-15" },
    ],
  },
  {
    id: 3,
    title: "Rewind",
    year: "2022",
    trackCount: 1,
    image: "/img/releases/rewind.webp",
    tracks: [
      { id: 3, title: "Rewind", album: "Rewind", duration: "4:53", releaseDate: "2022-03-22" },
    ],
  },
  {
    id: 4,
    title: "Your Lie",
    year: "2020",
    trackCount: 1,
    image: "/img/releases/yourlie.webp",
    tracks: [
      { id: 4, title: "Your Lie", album: "Your Lie", duration: "3:420", releaseDate: "2020-06-02" },
      { id: 5, title: "Letter", album: "Your Lie", duration: "3:06", releaseDate: "2020-06-02" },
      { id: 6, title: "Flowers", album: "Your Lie", duration: "4:14", releaseDate: "2020-06-02" },
    ],
  },
  {
    id: 5,
    title: "Even to Dream",
    year: "2023",
    trackCount: 1,
    image: "/img/releases/e2d.webp",
    tracks: [
      { id: 7, title: "Even to Dream", album: "E2D", duration: "3:50", releaseDate: "2019-05-16" },
    ],
  },
  {
    id: 6,
    title: "ExGirl",
    year: "2017",
    trackCount: 1,
    image: "/img/releases/exgirl.webp",
    tracks: [
      { id: 8, title: "ExGirl", album: "EX", duration: "4:10", releaseDate: "2017-07-25" },
    ],
  },
  {
    id: 7,
    title: "Akai",
    year: "2017",
    trackCount: 1,
    image: "/img/releases/akai.webp",
    tracks: [
      { id: 9, title: "Akai", album: "Akai", duration: "3:53", releaseDate: "2017-02-27" },
    ],
  },
];

const singles: Track[] = [
  { id: 12, title: "Midnight Drive", album: "Single", duration: "3:35", releaseDate: "2024-04-20" },
  { id: 13, title: "Cyber Dawn", album: "Single", duration: "4:15", releaseDate: "2024-02-15" },
  { id: 14, title: "Electric Soul", album: "Single", duration: "3:50", releaseDate: "2023-12-01" },
  { id: 15, title: "Digital Love", album: "Single", duration: "4:25", releaseDate: "2023-10-12" },
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

      <Tabs defaultValue="albums" className="w-full px-4">
        {/* TabsList responsive */}
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 p-1 bg-green-900/20">
          <TabsTrigger value="albums" className="text-sm py-2">Albums</TabsTrigger>
          <TabsTrigger value="singles" className="text-sm py-2">Singles</TabsTrigger>
          <TabsTrigger value="remixes" className="text-sm py-2">Remixes</TabsTrigger>
        </TabsList>

        <TabsContent value="albums" className="space-y-8">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Imagen responsive */}
              <div className="relative bg-black/30 w-full md:w-[300px] h-64 md:h-auto mx-auto md:mx-0">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4 md:p-6 flex-1">
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold">{album.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <span>{album.year}</span>
                    <span>•</span>
                    <span>{album.trackCount} tracks</span>
                  </div>
                  
                  {/* Botones responsivos */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button className="bg-green-500 hover:bg-green-600 text-black text-sm py-1.5 px-3 min-w-[100px]">
                      <Play className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Play All</span>
                    </Button>
                    <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20 text-sm py-1.5 px-3">
                      <ImageDown className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Wallpaper</span>
                    </Button>
                    <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20 text-sm py-1.5 px-3">
                      <Download className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">MP3</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20 p-1.5"
                      onClick={() => handleShareAlbum(album)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Lista de tracks responsive */}
                <div className="space-y-1">
                  {album.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-green-500/10 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-6 text-center text-sm">{index + 1}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-3 w-3" />
                        </Button>
                        <span className="text-sm">{track.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">{track.duration}</span>
                      </div>
                    </div>
                  ))}
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 hover:bg-green-500/10 rounded-md"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Play className="h-4 w-4" />
                      </Button>
                      <div>
                        <div className="font-medium">{single.title}</div>
                        <div className="text-xs text-gray-500">
                          Released: {new Date(single.releaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">{single.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
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