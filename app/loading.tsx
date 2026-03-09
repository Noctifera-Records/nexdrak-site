'use client';

import LoadingSpinner from '@/components/loading-spinner';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="text-white">
        <LoadingSpinner variant="audio" size="lg" />
      </div>
      <p className="text-white/60 text-sm tracking-widest uppercase animate-pulse">Loading</p>
    </div>
  );
}
