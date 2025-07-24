"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const cookies: Record<string, string> = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.split("=").map(decodeURIComponent);
        acc[key] = value;
        return acc;
      }, {});

    if (!cookies.cookieConsentDismissed) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCloseBanner = () => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);

    document.cookie = `cookieConsentDismissed=true; expires=${expirationDate.toUTCString()}; path=/`;
    setShowCookieBanner(false);
  };

  if (!showCookieBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 border border-white/30 rounded-lg p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom flex items-center gap-4 max-w-md w-full md:hidden">
      <p className="text-sm text-gray-300 flex-1">
        We use cookies to improve your website experience. By continuing to
        browse the site, you agree to our use of cookies.
      </p>
      <button
        onClick={handleCloseBanner}
        className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Close cookies banner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
