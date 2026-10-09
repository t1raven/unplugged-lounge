import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteSettings = await getSiteSettings();
  const SITE_URL = siteSettings?.general?.siteUrl ?? 'https://www.unplugged-lounge.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
