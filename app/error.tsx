'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-gray-400">An unexpected error occurred.</p>
          <div className="flex items-center gap-3 justify-center">
            <Button className="bg-white text-black hover:bg-gray-200" onClick={() => reset()}>
              Try again
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
