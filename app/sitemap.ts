import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { getSiteSettings } from '@/lib/siteSettings';

interface PerformanceSitemap {
  slug: string;
  updatedAt: string;
}

const performanceQuery = `
  *[
    _type == "performance" &&
    defined(slug.current)
  ] {
    "slug": slug.current,
    "updatedAt": _updatedAt
  }
`;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteSettings = await getSiteSettings();
  const SITE_URL = siteSettings?.general?.siteUrl ?? 'https://unplugged-lounge.com';

  // 기본 페이지
  const staticPages: MetadataRoute.Sitemap = [
    '/',
    '/cafe',
    '/performances',
    '/goods',
    '/archives',
  ].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  // Sanity 공연 데이터
  const performances = await client.fetch<PerformanceSitemap[]>(
    performanceQuery,
    {},
    {
      perspective: 'published',
      useCdn: false,
    },
  );

  // 공연 상세페이지
  const performancePages: MetadataRoute.Sitemap = performances.map((performance) => ({
    url: new URL(`/performances/${encodeURIComponent(performance.slug)}`, SITE_URL).toString(),
    lastModified: new Date(performance.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...performancePages];
}
