"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Shuffle,
    Music, // Importa un ícono más genérico para el reproductor
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import AudioVisualizer from "./audio-visualizer";

interface Track {
    id: number;
    title: string;
    artist: string;
    src: string;
}

const originalTracks: Track[] = [
    { id: 1, title: "VENUS", artist: "NEXDRAK", src: "./music/dev.mp3" },
    { id: 2, title: "CALL ME BACK", artist: "NEXDRAK", src: "./music/dev2.mp3" },
    { id: 3, title: "SMOKE EM UP", artist: "PON3", src: "./music/smoke.ogg" },
    { id: 4, title: "DEAD TOWN", artist: "SAD MEAL", src: "./music/deadtown.ogg" },
    { id: 5, title: "BEGGARS", artist: "KREWELLA X DISKORD", src: "./music/beggards.ogg" },
    { id: 6, title: "BREATHE (VEXARE REMIX)", artist: "MAKA & WAECK FT. FARISHA", src: "./music/breathe.ogg" },
    { id: 7, title: "YOUR SMILE", artist: "NEXDRAK", src: "./music/yoursmile.ogg" },
    { id: 8, title: "EVEN TO DREAM", artist: "NEXDRAK", src: "./music/even.ogg" },
    { id: 9, title: "MONSTER (DOTEXE REMIX)", artist: "MEG & DIA", src: "./music/monster1.ogg" },
    { id: 10, title: "MY ROCK", artist: "CULPURATE", src: "./music/myrock.ogg" },
    { id: 11, title: "TILL IT'S OVER", artist: "TRISTAM", src: "./music/till.ogg" },
    { id: 12, title: "CAN YOU FEEL ME (ft NATHAN BRUMLEY)", artist: "WONTOLLA", src: "./music/wontolla.ogg" },
    { id: 13, title: "FIND YOU (PRFFTT & SVYABLE)", artist: "ELXPROD & SKRUX", src: "./music/skrux.ogg" },
    { id: 14, title: "PARADISE (FT. ALEXA LUSADER)", artist: "DIFFERENT HEAVEN", src: "./music/paradise.ogg" },
    { id: 15, title: "BLOSSOM", artist: "AU5", src: "./music/au5.ogg" },
    { id: 16, title: "SKY BRIDGE", artist: "NEXDRAK", src: "./music/sky.ogg" },
    { id: 17, title: "AKAI", artist: "NEXDRAK", src: "./music/akai.ogg" },
    { id: 18, title: "PASSO BEM SOLTO (SLOWED)", artist: "ATLXS", src: "./music/passo.ogg" },
];

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function MusicPlayer() {
    const [shuffledTracks, setShuffledTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const [isDuckVisible, setIsDuckVisible] = useState(false);
    const [buttonIcon, setButtonIcon] = useState(<Music className="h-5 w-5" />); // Cambiado a Music

    const audioRef = useRef<HTMLAudioElement>(null);
    const isNewTrackLoading = useRef(false);

    const COOLDOWN_DURATION = 1100;

    const withCooldown = (fn: () => void) => {
        if (isCooldown) return;
        setIsCooldown(true);
        fn();
        setTimeout(() => setIsCooldown(false), COOLDOWN_DURATION);
    };

    const playCurrentTrack = useCallback(() => {
        if (audioRef.current) {
            const promise = audioRef.current.play();
            promise?.catch((e) => {
                console.error("Playback error:", e);
                setIsPlaying(false);
            });
        }
    }, []);

    useEffect(() => {
        setShuffledTracks(shuffleArray(originalTracks));
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isNewTrackLoading.current = true;
        playCurrentTrack();
    }, [currentTrackIndex, playCurrentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const togglePlay = () =>
        withCooldown(() => {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                playCurrentTrack();
                setIsPlaying(true);
            }
        });

    const handlePrevious = () =>
        withCooldown(() => {
            setCurrentTrackIndex((prev) => (prev === 0 ? shuffledTracks.length - 1 : prev - 1));
            setIsPlaying(true);
        });

    const handleNext = () =>
        withCooldown(() => {
            if (currentTrackIndex === shuffledTracks.length - 1) {
                setShuffledTracks(shuffleArray(originalTracks));
                setCurrentTrackIndex(0);
            } else {
                setCurrentTrackIndex((prev) => prev + 1);
            }
            setIsPlaying(true);
        });

    const reshuffleTracks = () =>
        withCooldown(() => {
            setShuffledTracks(shuffleArray(originalTracks));
            setCurrentTrackIndex(0);
            setIsPlaying(true);
        });

    const displayDuck = () => {
        setIsDuckVisible(true);
        // Cambia el ícono del botón a la imagen del pato.  Asegúrate de que la ruta sea correcta.
        setButtonIcon(<img src="/img/totem.gif" alt="Pato Totem" className="h-5 w-5" />);

        setTimeout(() => {
            setIsDuckVisible(false); // Oculta el "totem"
            setButtonIcon(<Music className="h-5 w-5" />); // Restablece el ícono a Music
        }, 2000);
    };

    const toggleMute = () =>
        withCooldown(() => {
            if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
            }
        });

    const handleProgressChange = (val: number[]) => {
        if (!audioRef.current) return;
        const time = (val[0] / 100) * audioRef.current.duration;
        audioRef.current.currentTime = time;
        setProgress(val[0]);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current || isNewTrackLoading.current) return;
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setProgress((current / total) * 100);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
        setProgress(0);
        isNewTrackLoading.current = false;
        audioRef.current.muted = isMuted;
        if (isPlaying) playCurrentTrack();
    };

    const handleVolumeChange = (val: number[]) => {
        const vol = val[0] / 100;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const current = shuffledTracks[currentTrackIndex];
    if (!current) return null;

    return (
        <>
            <AudioVisualizer audioElement={audioRef.current} isPlaying={isPlaying} />
            {isDuckVisible && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                    {/* Ajusta el tamaño y estilo según sea necesario */}
                    <img src="./img/totem.gif" alt="Pato Totem" className="max-w-64 max-h-64" />
                </div>
            )}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/20 transition-all duration-300 ${
                    isExpanded ? "h-32" : "h-16"
                }`}
            >
                <div className="container mx-auto px-4 h-full flex flex-col">
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleProgressChange}
                        className="h-1 w-full"
                    />
                    {isExpanded && (
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2 w-1/3">
                            <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-xs">
                                        {current.title}
                                    </span>
                                    <span className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                                        {current.artist}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-4 w-1/3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={displayDuck}
                                disabled={isCooldown}
                                className="text-gray-400 hover:text-white"
                            >
                                {buttonIcon}  {/* Usa el estado del ícono aquí */}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevious}
                                disabled={isCooldown}
                                className="text-gray-400 hover:text-white"
                            >
                                <SkipBack className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={togglePlay}
                                disabled={isCooldown}
                                className="rounded-full border-white text-white hover:bg-white/20"
                            >
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                disabled={isCooldown}
                                className="text-gray-400 hover:text-white"
                            >
                                <SkipForward className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={reshuffleTracks}
                                disabled={isCooldown}
                                className="text-gray-400 hover:text-white"
                            >
                                <Shuffle className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-end space-x-2 w-1/3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                disabled={isCooldown}
                                className="text-gray-400 hover:text-white"
                            >
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="w-20 hidden sm:block">
                                <Slider
                                    value={[volume * 100]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <audio
                    key={current.id}
                    ref={audioRef}
                    src={current.src}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleNext}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => {
                        console.error("Audio error:", e);
                        setIsPlaying(false);
                    }}
                />
            </div>
        </>
    );
}

