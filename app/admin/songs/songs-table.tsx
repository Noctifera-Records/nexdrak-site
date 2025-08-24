"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  ExternalLink,
  Music,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/image-upload";
import Image from "next/image";

interface Song {
  id: number;
  title: string;
  artist: string | null;
  stream_url: string;
  cover_image_url: string | null;
  type: "album" | "single";
  album_name?: string | null;
  track_number?: number | null;
  release_date?: string | null;
  created_at: string;
}

interface SongsTableProps {
  songs: Song[];
}

export default function SongsTable({ songs: initialSongs }: SongsTableProps) {
  const [songs, setSongs] = useState(initialSongs);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Filtrar canciones por término de búsqueda
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSong = async (songData: Omit<Song, "id" | "created_at">) => {
    setLoading(true);
    try {
      console.log("Adding song with data:", songData);

      // Asegurar que el tipo esté definido
      const completeData = {
        ...songData,
        type: songData.type || "single",
      };

      const { data, error } = await supabase
        .from("songs")
        .insert([completeData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      setSongs([data, ...songs]);
      setShowAddDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding song:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al agregar canción";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSong = async (songId: number, updates: Partial<Song>) => {
    setLoading(true);
    try {
      // Encontrar la canción actual para preservar campos requeridos
      const currentSong = songs.find((song) => song.id === songId);
      if (!currentSong) {
        throw new Error("Canción no encontrada");
      }

      // Asegurar que el tipo se preserve si no se está actualizando
      const updateData = {
        ...updates,
        type: updates.type || currentSong.type,
      };

      const { error } = await supabase
        .from("songs")
        .update(updateData)
        .eq("id", songId);

      if (error) throw error;

      setSongs(
        songs.map((song) =>
          song.id === songId ? { ...song, ...updateData } : song
        )
      );

      setEditingSong(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating song:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar canción";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (songId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("songs").delete().eq("id", songId);

      if (error) throw error;

      setSongs(songs.filter((song) => song.id !== songId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Error al eliminar canción");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y botón agregar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar canciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-gray-200">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Canción
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Nueva Canción</DialogTitle>
              <DialogDescription className="text-gray-400">
                Agrega una nueva canción a tu catálogo
              </DialogDescription>
            </DialogHeader>
            <SongForm onSave={handleAddSong} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de canciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden group hover:border-gray-600 transition-all"
          >
            {/* Imagen de portada */}
            <div className="aspect-square bg-gray-800 relative">
              {song.cover_image_url ? (
                <Image
                  src={song.cover_image_url}
                  alt={song.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-16 w-16 text-gray-600" />
                </div>
              )}

              {/* Overlay con botón de streaming */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white/20"
                  asChild
                >
                  <a
                    href={song.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    ESCUCHAR
                  </a>
                </Button>
              </div>
            </div>

            {/* Información */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {song.title}
                </h3>
                {song.artist && (
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    {song.artist}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(song.created_at)}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-700">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSong(song)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Editar Canción
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Modifica la información de la canción
                      </DialogDescription>
                    </DialogHeader>
                    {editingSong && (
                      <SongForm
                        song={editingSong}
                        onSave={(data) =>
                          handleUpdateSong(editingSong.id, data)
                        }
                        loading={loading}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Eliminar Canción
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        ¿Estás seguro de que quieres eliminar "{song.title}"?
                        Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteSong(song.id)}
                        disabled={loading}
                      >
                        {loading ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm ? "No se encontraron canciones" : "No hay canciones"}
          </p>
          <p className="text-gray-500 text-sm">
            {!searchTerm && "Agrega tu primera canción para comenzar"}
          </p>
        </div>
      )}
    </div>
  );
}

function SongForm({
  song,
  onSave,
  loading,
}: {
  song?: Song;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(song?.title || "");
  const [artist, setArtist] = useState(song?.artist || "");
  const [streamUrl, setStreamUrl] = useState(song?.stream_url || "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    song?.cover_image_url || ""
  );
  const [type, setType] = useState<"album" | "single">(song?.type || "single");
  const [albumName, setAlbumName] = useState(song?.album_name || "");
  const [trackNumber, setTrackNumber] = useState(
    song?.track_number?.toString() || ""
  );
  const [releaseDate, setReleaseDate] = useState(song?.release_date || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      artist: artist || null,
      stream_url: streamUrl,
      cover_image_url: coverImageUrl || null,
      type,
      album_name: type === "album" ? albumName || null : null,
      track_number:
        type === "album" && trackNumber ? parseInt(trackNumber) : null,
      release_date: releaseDate || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[70vh] overflow-y-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white">
            Título de la Canción *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Nombre de la canción"
            required
          />
        </div>

        <div>
          <Label htmlFor="artist" className="text-white">
            Artista
          </Label>
          <Input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Nombre del artista"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="streamUrl" className="text-white">
          URL de Streaming *
        </Label>
        <Input
          id="streamUrl"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="https://open.spotify.com/track/..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Enlace a Spotify, Apple Music, YouTube, etc.
        </p>
      </div>

      <div>
        <Label htmlFor="type" className="text-white">
          Tipo *
        </Label>
        <Select
          value={type}
          onValueChange={(value: "album" | "single") => setType(value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="album">Álbum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "album" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="albumName" className="text-white">
              Nombre del Álbum
            </Label>
            <Input
              id="albumName"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Nombre del álbum"
            />
          </div>

          <div>
            <Label htmlFor="trackNumber" className="text-white">
              Número de Track
            </Label>
            <Input
              id="trackNumber"
              type="number"
              min="1"
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="1"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="releaseDate" className="text-white">
          Fecha de Lanzamiento
        </Label>
        <Input
          id="releaseDate"
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <Label className="text-white">Imagen de Portada</Label>
        <div className="space-y-3">
          <ImageUpload
            value={coverImageUrl}
            onChange={(value) => setCoverImageUrl(value || "")}
            label=""
            maxSize={3}
          />
          <div className="text-xs text-gray-400">
            O ingresa una URL directamente:
          </div>
          <Input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading || !title || !streamUrl}
          className="bg-white text-black hover:bg-gray-200"
        >
          {loading ? "Guardando..." : song ? "Actualizar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
}
