import type { Metadata } from 'next';

import { client } from '@/sanity/lib/client';

import SubPageHero from '@/components/common/SubPageHero';
import ArchiveList from '@/components/archives/List';

import type { Category } from '@/types/category';
import type { Archive } from '@/types/archive';

export const metadata: Metadata = {
  title: '아카이브',
};

const categoryQuery = `
  *[
    _type == "galleryCategory" 
    && visible == true
  ]
  | order(orderRank) {
    _id,
    title,
    "slug": slug.current,
  }
`;

const listQuery = `
  *[
    _type == "galleryItem" 
    && category->slug.current == $category
    && display == true
  ]
  | order(orderRank) 
  [0...12] {
    _id,
    title,
    description,
    label,

    "category": category->{
      _id,
      title,
      "slug": slug.current
    },

    performance-> {
      _id,
      slug,
    },

    "imageUrl": image.asset->url
  }
`;

export const revalidate = 0;

export default async function ArchivesPage() {
  const categories = await client.fetch<Category[]>(categoryQuery);

  const activeCategory = categories[0]?.slug ?? '';

  const items = activeCategory
    ? await client.fetch<Archive[]>(listQuery, {
        category: activeCategory,
      })
    : [];

  return (
    <main id="site-body" className="gallery-page">
      <SubPageHero
        label="Archives"
        title="언플러그드 <br/>Moments"
        description="우리의 음악이 함께 하는 순간들"
      />
      <ArchiveList categories={categories} items={items} />
    </main>
  );
}
