import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';

import { getSiteSettings } from '@/lib/siteSettings';
import { urlFor } from '@/sanity/lib/image';

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

  const ogImage = siteSettings?.seo?.ogImage
    ? urlFor(siteSettings.seo.ogImage).url()
    : '/images/common/og-image.png';
  const SITE_URL = `${siteSettings?.general?.siteUrl ?? 'https://www.unplugged-lounge.com'}/artists/${slug}`;

  return {
    title: `${artist.name} | 아티스트`,
    description: `언플러그드 라운지에서 ${artist.name}의 공연정보를 확인해보세요.`,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      title: artist.name,
      images: [
        {
          url: ogImage,
          alt: artist.name,
        },
      ],
      url: SITE_URL,
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
