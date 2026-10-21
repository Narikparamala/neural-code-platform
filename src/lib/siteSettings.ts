import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type SiteSettings = {
  logo_url: string;
  instagram_url: string;
  telegram_url: string;
  youtube_url: string;
  tiktok_url: string;
  support_url: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  logo_url:
    'https://res.cloudinary.com/doourcehz/image/upload/w_128,h_128,c_fill,f_webp,q_auto/v1762704996/download_1_t0xokx.jpg',
  instagram_url: 'https://www.instagram.com/cosmicspirit0official/',
  telegram_url: 'https://t.me/cs0telegram',
  youtube_url: 'https://www.youtube.com/@cosmicspirit0',
  tiktok_url: 'https://www.tiktok.com/@cosmicspirit0',
  support_url: 'https://paypal.me/ParamalaKiran',
};

let cache: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;

/**
 * Loads the admin-editable branding/social settings once per page load.
 * Falls back to the defaults above if the table is unreachable.
 */
export async function loadSiteSettings(force = false): Promise<SiteSettings> {
  if (!force && cache) return cache;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_url, instagram_url, telegram_url, youtube_url, tiktok_url, support_url')
        .eq('id', 1)
        .maybeSingle();
      cache = { ...DEFAULT_SETTINGS, ...(data || {}) };
    } catch {
      cache = DEFAULT_SETTINGS;
    }
    return cache as SiteSettings;
  })();

  const result = await inflight;
  inflight = null;
  return result;
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    loadSiteSettings().then((next) => {
      if (alive) setSettings(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}

/** Strip protocol/trailing slash so a URL can be shown as a handle. */
export function prettyHandle(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname.replace(/\/+$/, '') || '/' + u.hostname).replace(/^\//, '@');
  } catch {
    return url;
  }
}
