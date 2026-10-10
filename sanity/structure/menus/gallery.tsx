import type { MenuFactory } from '../types';
import { API_VERSION } from '../types';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { ImageIcon } from '@sanity/icons/Image';
import { TiersIcon } from '@sanity/icons/Tiers';
import { CategoryCountBadge, CategoryNullCountBadge } from '../../components/ui/StudioCountBadge';
export const createGalleryCategoryMenu: MenuFactory = (S, context) => {
  return orderableDocumentListDeskItem({
    type: 'galleryCategory',
    title: '아카이브 카테고리',
    icon: TiersIcon,
    S,
    context,
  });
};
export const createGalleryMenu: MenuFactory = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });
  return S.listItem()
    .id('gallery-images')
    .title('아카이브 이미지')
    .icon(ImageIcon)
    .child(async () => {
      const categories = await client.fetch<
        {
          _id: string;
          title: string;
        }[]
      >(`
          *[_type == "galleryCategory"]
          | order(orderRank asc) {
            _id,
            title
          }
        `);
      const nullFilter = '_type == "galleryItem" && !defined(category._ref)';
      const nullCount = await client.fetch<number>(`count(*[${nullFilter}])`);

      return S.list()
        .id('gallery-images-category-list')
        .title('아카이브 이미지')
        .items([
          ...categories.map((category) => {
            // 공연 카테고리만 연도별 분류
            if (category._id === 'b357b289-48b0-4924-b0ef-7ee003296edf') {
              return S.listItem()
                .id(`gallery-${category._id}`)
                .title(category.title)
                .icon(() =>
                  CategoryCountBadge({
                    type: 'galleryItem',
                    categoryId: category._id,
                  }),
                )
                .child(async () => {
                  const dates = await client.fetch<{ date?: string }[]>(
                    `
                    *[
                      _type == "galleryItem"
                      && category._ref == $categoryId
                      && defined(performanceDate)
                    ] {
                      "date": performanceDate
                    }
                  `,
                    { categoryId: category._id },
                  );

                  const years = [
                    ...new Set(
                      dates
                        .map((item) => (item.date ? new Date(item.date).getFullYear() : null))
                        .filter((year): year is number => year !== null),
                    ),
                  ].sort((a, b) => b - a);

                  const nullDateFilter =
                    '_type == "galleryItem" && category._ref == $categoryId && (!defined(performanceDate) || performanceDate == "")';
                  const nullDateCount = await client.fetch<number>(`count(*[${nullDateFilter}])`, {
                    categoryId: category._id,
                  });

                  return S.list()
                    .id(`gallery-years-${category._id}`)
                    .title(category.title)
                    .items([
                      ...years.map((year) => {
                        const yearStart = `${year}-01-01T00:00:00.000Z`;

                        const yearEnd = `${year + 1}-01-01T00:00:00.000Z`;

                        return orderableDocumentListDeskItem({
                          type: 'galleryItem',

                          id: `gallery-${category._id}-${year}`,

                          title: `${year}년`,

                          icon: () =>
                            CategoryCountBadge({
                              type: 'galleryItem',
                              categoryId: category._id,
                              year: year,
                            }),

                          filter: `
                            _type == "galleryItem"
                            && category._ref == $categoryId
                            && performanceDate >= $yearStart
                            && performanceDate < $yearEnd
                          `,

                          params: {
                            categoryId: category._id,
                            yearStart,
                            yearEnd,
                          },

                          S,
                          context,
                        });
                      }),
                      ...(nullCount > 0
                        ? [
                            orderableDocumentListDeskItem({
                              type: 'galleryItem',
                              id: `gallery-${category._id}-other`,
                              title: '분류되지 않음',
                              icon: () => (
                                <CategoryCountBadge
                                  type="galleryItem"
                                  categoryId={category._id}
                                  year="other"
                                />
                              ),
                              filter: nullDateFilter,
                              params: { categoryId: category._id },
                              S,
                              context,
                            }),
                          ]
                        : []),
                    ]);
                });
            }

            // 그 외 카테고리는 기존 방식
            return orderableDocumentListDeskItem({
              type: 'galleryItem',

              id: `gallery-${category._id}`,

              title: category.title,

              icon: () =>
                CategoryCountBadge({
                  type: 'galleryItem',
                  categoryId: category._id,
                }),

              filter: '_type == "galleryItem" && category._ref == $categoryId',

              params: {
                categoryId: category._id,
              },

              S,
              context,
            });
          }),
          ...(nullCount > 0
            ? [
                orderableDocumentListDeskItem({
                  type: 'galleryItem',
                  id: 'gallery-null',
                  title: '분류되지 않음',
                  icon: () => CategoryNullCountBadge({ type: 'galleryItem' }),
                  filter: nullFilter,
                  S,
                  context,
                }),
              ]
            : []),
        ]);
    });
};
