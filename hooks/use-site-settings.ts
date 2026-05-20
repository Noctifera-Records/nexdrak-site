"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface SiteSettings {
  hero_album_link: string;
  hero_background_image: string;
  hero_release_image: string;
  hero_release_text: string;
  site_logo: string;
  site_logo_mobile: string;
  navbar_logo: string;
  site_title: string;
  site_description: string;
  contact_email: string;
  booking_email: string;
}

const defaultSettings: SiteSettings = {
  hero_album_link: "https://album.link/thequietone",
  hero_background_image: "/placeholder.png",
  hero_release_image: "/img/red.png",
  hero_release_text: "NEW RELEASE",
  site_logo: "/img/logo.png",
  site_logo_mobile: "/img/logo.png",
  navbar_logo: "/nav-logo.webp",
  site_title: "NexDrak",
  site_description: "Official website of NexDrak - Music Artist",
  contact_email: "contact@nexdrak.com",
  booking_email: "mgmt@nexdrak.com",
};

// Objeto para cachear los settings y evitar múltiples peticiones
let cachedSettings: SiteSettings | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || defaultSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  
  // Memorizamos el cliente para evitar recrearlo en cada render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value");

        if (error) {
          console.error("Error fetching site settings:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (data && isMounted) {
          const settingsMap: Partial<SiteSettings> = {};
          data.forEach((item) => {
            if (item.key in defaultSettings) {
              (settingsMap as any)[item.key] =
                item.value || (defaultSettings as any)[item.key];
            }
          });

          const finalSettings = { ...defaultSettings, ...settingsMap };
          cachedSettings = finalSettings;
          setSettings(finalSettings);
        }
      } catch (error) {
        console.error("Error site-settings hook:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Si ya tenemos caché, no volvemos a pedir inmediatamente (ahorro de CPU)
    if (!cachedSettings) {
      fetchSettings();
    } else {
      setLoading(false);
    }

    // ELIMINAMOS LA SUSCRIPCIÓN REALTIME
    // Esta era la causa del error "cannot add postgres_changes callbacks"
    // que rompía el sitio. Los ajustes del sitio no cambian tan a menudo
    // como para arriesgar la estabilidad del sitio por esto.

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return { settings, loading };
}
