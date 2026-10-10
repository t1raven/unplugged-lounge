import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const goodsItem = defineType({
  name: 'goodsItem',
  title: '굿즈 아이템',
  type: 'document',

  orderings: [orderRankOrdering],

  fields: [
    orderRankField({
      type: 'goodsItem',
      newItemPosition: 'before',
    }),

    defineField({
      name: 'name',
      title: '상품명',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-가-힣]+/g, '')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: '카테고리',
      type: 'reference',
      to: [
        {
          type: 'goodsCategory',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      title: '상품 이미지',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'price',
      title: '판매가',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'salePrice',
      title: '할인가',
      type: 'number',
      description: '비워두면 정상가로 판매됩니다.',
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'quantityDiscounts',
      title: '수량 할인',
      type: 'array',
      description: '수량이 많을수록 할인 단가를 설정합니다.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'minQuantity',
              title: '최소 수량',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(2),
            },

            {
              name: 'unitPrice',
              title: '할인 단가',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(0),
            },
          ],

          preview: {
            select: {
              minQuantity: 'minQuantity',
              unitPrice: 'unitPrice',
            },

            prepare({ minQuantity, unitPrice }) {
              return {
                title: `${minQuantity}개 이상`,

                subtitle: `개당 ${unitPrice?.toLocaleString() ?? 0}원`,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: 'description',
      title: '상품 설명',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'options',
      title: '상품 옵션',
      type: 'array',
      description: '사이즈, 색상 등 구매 시 선택할 옵션',
      of: [
        {
          type: 'object',
          name: 'goodsOption',
          title: '옵션',
          fields: [
            {
              name: 'name',
              title: '옵션명',
              type: 'string',
              description: '예: 사이즈, 색상',
              validation: (Rule) => Rule.required(),
            },

            {
              name: 'values',
              title: '옵션값',
              type: 'array',
              of: [
                {
                  type: 'string',
                },
              ],
              validation: (Rule) => Rule.min(1),
            },
          ],

          preview: {
            select: {
              name: 'name',
              values: 'values',
            },
            prepare({ name, values }) {
              return {
                title: name,
                subtitle: Array.isArray(values) ? values.join(', ') : '',
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: 'stock',
      title: '재고',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.required().integer().min(0),
    }),

    defineField({
      name: 'label',
      title: '라벨',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'list',
        list: [
          { title: 'NEW', value: 'new' },
          { title: 'BEST', value: 'best' },
        ],
      },
    }),

    defineField({
      name: 'soldOut',
      title: '품절',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'isAvailable',
      title: '판매중',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
      category: 'category.title',
      price: 'price',
      isAvailable: 'isAvailable',
      soldOut: 'soldOut',
    },

    prepare({ title, media, category, price, isAvailable, soldOut }) {
      let status = '판매중';

      if (!isAvailable) status = '판매중지';
      if (soldOut) status = '품절';

      return {
        title,
        subtitle: `${category ?? ''} · ${price?.toLocaleString() ?? 0}원 · ${status}`,
        media,
      };
    },
  },
});
