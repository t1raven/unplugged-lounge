import type { MenuFactory } from '../types';
import { API_VERSION } from '../types';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { BottleIcon } from '@sanity/icons/Bottle';
import { TiersIcon } from '@sanity/icons/Tiers';
import { CategoryCountBadge } from '../../components/ui/StudioCountBadge';
export const createCafeCategoryMenu: MenuFactory = (S, context) => {
  return orderableDocumentListDeskItem({
    type: 'menuCategory',
    title: '카페 카테고리',
    icon: TiersIcon,
    S,
    context,
  });
};
export const createCafeMenu: MenuFactory = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });
  return S.listItem()
    .id('cafe-menu')
    .title('카페 메뉴')
    .icon(BottleIcon)
    .child(async () => {
      const categories = await client.fetch<
        {
          _id: string;
          title: string;
        }[]
      >(`
          *[_type == "menuCategory"]
          | order(orderRank asc) {
            _id,
            title
          }
        `);

      return S.list()
        .id('cafe-menu-category-list')
        .title('카페 메뉴')
        .items(
          categories.map((category) =>
            orderableDocumentListDeskItem({
              type: 'menuItem',
              id: `menu-${category._id}`,
              title: `${category.title}`,
              icon: () => CategoryCountBadge({ type: 'menuItem', categoryId: category._id }),

              filter: '_type == "menuItem" && category._ref == $categoryId',

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
