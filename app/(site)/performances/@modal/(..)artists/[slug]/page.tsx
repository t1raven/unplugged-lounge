import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';

import ArtistModal from '@/components/artists/Modal';
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

export default async function ArtistViewPage({ params }: Props) {
  const { slug } = await params;

  const artist = await client.fetch(artistQuery, { slug: decodeURIComponent(slug) });

  if (!artist) {
    notFound();
  }

  const performances = await client.fetch(artistPerformancesQuery, { artistId: artist._id });

  return (
    <ArtistModal>
      <ArtistView artist={artist} performances={performances} />
    </ArtistModal>
  );
}
