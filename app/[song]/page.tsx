'use client';

import { use } from "react";
import ClientSongPage from "./ClientSongPage";

interface SongPageProps {
  params: Promise<{
    song: string;
  }>;
}

export default function SongPage({ params }: SongPageProps) {
  const p = use(params) as { song: string };
  const routeSong = p?.song || '';
  
  return <ClientSongPage slug={routeSong} />;
}
