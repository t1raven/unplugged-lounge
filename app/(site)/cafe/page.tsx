import type { Metadata } from 'next';

import { client } from '@/sanity/lib/client';

import SubPageHero from '@/components/common/SubPageHero';
import MenuList from '@/components/cafe/List';

import type { Category } from '@/types/category';
import type { Cafe } from '@/types/cafe';

export const metadata: Metadata = {
  title: '카페',
};

const categoryQuery = `
  *[
    _type == "menuCategory"
    && visible == true
  ]
  | order(orderRank) {
    _id,
    title,
    "slug": slug.current
  }
`;

const listQuery = `
  *[
    _type == "menuItem"
    && category->slug.current == $category
    && isAvailable == true
  ]
  | order(orderRank) {
    _id,
    name,
    description,
    price,
    newItem,
    bestItem,

    "category": category->{
      _id,
      title,
      "slug": slug.current
    },

    "imageUrl": image.asset->url
  }
`;

export const revalidate = 0;

export default async function CafePage() {
  const categories = await client.fetch<Category[]>(categoryQuery);

  const activeCategory = categories[0]?.slug ?? '';

  const items = activeCategory
    ? await client.fetch<Cafe[]>(listQuery, {
        category: activeCategory,
      })
    : [];

  return (
    <main id="site-body" className="menu-page">
      <SubPageHero
        label="CAFE MENU"
        title="서교음악다방"
        description="음악과 사람이 머무는 공간<br/> 자유롭고 아름다운 추억이 가득한 청춘 쉼터"
      />
      <MenuList categories={categories} items={items} />
    </main>
  );
}
