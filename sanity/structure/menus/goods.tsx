import type { MenuFactory } from '../types';
import { API_VERSION } from '../types';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { PackageIcon } from '@sanity/icons/Package';
import { TiersIcon } from '@sanity/icons/Tiers';
import { CategoryCountBadge } from '../../components/ui/StudioCountBadge';
export const createGoodsCategoryMenu: MenuFactory = (S, context) => {
  return orderableDocumentListDeskItem({
    type: 'goodsCategory',
    title: '굿즈 카테고리',
    icon: TiersIcon,
    S,
    context,
  });
};
export const createGoodsMenu: MenuFactory = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });
  return S.listItem()
    .id('goods-item')
    .title('굿즈 아이템')
    .icon(PackageIcon)
    .child(async () => {
      const categories = await client.fetch<
        {
          _id: string;
          title: string;
        }[]
      >(`
          *[_type == "goodsCategory"]
          | order(orderRank asc) {
            _id,
            title
          }
        `);

      return S.list()
        .id('goods-item-category-list')
        .title('굿즈 아이템')
        .items(
          categories.map((category) =>
            orderableDocumentListDeskItem({
              type: 'goodsItem',
              id: `goods-${category._id}`,
              title: `${category.title}`,
              icon: () => CategoryCountBadge({ type: 'goodsItem', categoryId: category._id }),

              filter: '_type == "goodsItem" && category._ref == $categoryId',

              params: {
                categoryId: category._id,
              },

              S,
              context,
            }),
          ),
        );
    });
};
