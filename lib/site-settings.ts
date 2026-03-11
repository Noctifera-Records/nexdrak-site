import { createServiceRoleClient } from "@/lib/supabase/service";

export interface SiteSettings {
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from("site_settings").select("key,value");

    if (error || !data || data.length === 0) {
      return defaultSettings;
    }

    const settingsMap: Partial<SiteSettings> = {};
    data.forEach((item: { key: string; value: string }) => {
      if (item.key in defaultSettings) {
        (settingsMap as any)[item.key] = item.value || (defaultSettings as any)[item.key];
      }
    });

    return { ...defaultSettings, ...settingsMap };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return defaultSettings;
  }
}
