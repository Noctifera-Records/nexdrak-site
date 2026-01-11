"use client";

import { useState, useEffect } from "react";
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
  site_logo: "/placeholder.png",
  site_logo_mobile: "/placeholder.png",
  navbar_logo: "/nav-logo.webp",
  site_title: "NexDrak",
  site_description: "Official website of NexDrak - Electronic Music Artist",
  contact_email: "contact@nexdrak.com",
  booking_email: "mgmt@nexdrak.com",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value");

        if (error) {
          console.error("Error fetching site settings:", error);
          setLoading(false);
          return;
        }

        if (data) {
          const settingsMap: Partial<SiteSettings> = {};
          data.forEach((item) => {
            if (item.key in defaultSettings) {
              (settingsMap as any)[item.key] =
                item.value || (defaultSettings as any)[item.key];
            }
          });

          setSettings({ ...defaultSettings, ...settingsMap });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { settings, loading };
}
