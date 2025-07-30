"use client";

import { useEffect, useState } from "react";

interface OptimizedLoaderProps {
  children: React.ReactNode;
}

export default function OptimizedLoader({ children }: OptimizedLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Immediate load for server-side rendered content
    if (typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    // Check if page is already loaded
    if (document.readyState === "complete") {
      setIsLoaded(true);
      return;
    }

    // Handle resource loading errors (429, etc.)
    const handleResourceError = (event: ErrorEvent) => {
      console.warn("Resource loading error detected, but continuing...");
      // Don't set error state for resource loading issues
      // Just continue loading
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn("Promise rejection detected:", event.reason);
      event.preventDefault(); // Prevent crash
    };

    // Add error listeners
    window.addEventListener("error", handleResourceError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Force load after short delay regardless of resource status
    const forceLoadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000); // Reduced to 1 second

    // Listen for actual page load
    const handleLoad = () => {
      clearTimeout(forceLoadTimer);
      setIsLoaded(true);
    };

    if (document.readyState === "loading") {
      window.addEventListener("load", handleLoad);
    } else {
      handleLoad();
    }

    return () => {
      clearTimeout(forceLoadTimer);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("error", handleResourceError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [retryCount]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setRetryCount((prev) => prev + 1);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4">Loading Error</h2>
          <p className="text-gray-300 mb-4">
            Some resources failed to load, but you can continue.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-4"
          >
            Retry
          </button>
          <button
            onClick={() => setIsLoaded(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-white mb-4">Loading...</div>
          <div className="text-gray-400 text-sm">
            If this takes too long, there might be network issues
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
