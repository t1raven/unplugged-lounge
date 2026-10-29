import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';

import { getSiteSettings } from '@/lib/siteSettings';

import ArtistView from '@/components/artists/View';

const artistQuery = `
  *[
    _type == "artist" &&
    slug.current == $slug
  ][0] {
    _id,
    name,
    slug,
    instagram
  }
`;

const artistPerformancesQuery = `
  *[
    _type == "performance" &&
    references($artistId) &&
    defined(date)
  ] | order(date asc) {
    _id,
    title,
    slug,
    date,
    poster,
    artists[]->{
      _id,
      name,
      slug
    }
  }
`;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteSettings = await getSiteSettings();
  const artist = await client.fetch(artistQuery, { slug: decodeURIComponent(slug) });

  if (!artist) {
    return {
      title: 'Not Found - Artist',
    };
  }

  const SITE_URL = `${siteSettings?.general?.siteUrl ?? 'https://www.unplugged-lounge.com'}/artists/${slug}`;

  return {
    title: artist.name,
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export default async function ArtistViewPage({ params }: Props) {
  const { slug } = await params;

  const artist = await client.fetch(artistQuery, { slug: decodeURIComponent(slug) });

  if (!artist) {
    notFound();
  }

  const performances = await client.fetch(artistPerformancesQuery, { artistId: artist._id });

  return (
    <main id="site-body" className="artist-view">
      <ArtistView artist={artist} performances={performances} />
    </main>
  );
}
