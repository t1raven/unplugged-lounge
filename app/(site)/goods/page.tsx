import type { Metadata } from 'next';

import { client } from '@/sanity/lib/client';
import { getSiteSettings } from '@/lib/siteSettings';

import SubPageHero from '@/components/common/SubPageHero';
import GoodsList from '@/components/goods/List';

import type { Category } from '@/types/category';
import type { Goods } from '@/types/goods';

export const metadata: Metadata = {
  title: '굿즈·앨범',
};

const categoryQuery = `
  *[
    _type == "goodsCategory" 
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
    _type == "goodsItem" 
    && category->slug.current == $category
    && isAvailable == true
  ]
  | order(orderRank) {
    _id,
    name,
    "slug": slug.current,
    description,

    price,
    salePrice,

    quantityDiscounts[]{
      minQuantity,
      unitPrice
    },

    "category": category->{
      _id,
      title,
      "slug": slug.current
    },

    "image": image.asset->url,

    options[]{
      name,
      values
    },

    stock,
    newItem,
    bestItem,
    soldOut
  }
`;

export const revalidate = 0;

export default async function goodsPage() {
  const [categories, siteSettings] = await Promise.all([
    client.fetch<Category[]>(categoryQuery),
    getSiteSettings(),
  ]);

  const orderDeliverySettings = {
    deliveryFee: siteSettings?.orderDelivery?.deliveryFee ?? 3000,
    depositAccount: siteSettings?.orderDelivery?.depositAccount ?? '',
    pickupAddress: siteSettings?.orderDelivery?.pickupAddress ?? '',
    pickupHours: siteSettings?.orderDelivery?.pickupHours ?? '',
  };

  const activeCategory = categories[0]?.slug ?? '';

  const items = activeCategory
    ? await client.fetch<Goods[]>(listQuery, {
        category: activeCategory,
      })
    : [];

  return (
    <main id="site-body" className="goods-page">
      <SubPageHero
        label="GOODS·ALBUM"
        title="굿즈·앨범"
        description="언플러그드 라운지에서 판매되는 <br/>다양한 라운지 상품과 아티스트 상품을 만나보세요."
      />
      <GoodsList
        categories={categories}
        items={items}
        orderDeliverySettings={orderDeliverySettings}
      />
    </main>
  );
}
