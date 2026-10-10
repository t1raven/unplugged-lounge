import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const menuItem = defineType({
  name: 'menuItem',
  title: '카페 메뉴',
  type: 'document',

  orderings: [orderRankOrdering],

  fields: [
    orderRankField({
      type: 'menuCategory',
      newItemPosition: 'before',
    }),

    defineField({
      name: 'name',
      title: '메뉴명',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: '카테고리',
      type: 'reference',
      to: [
        {
          type: 'menuCategory',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'price',
      title: '가격',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'image',
      title: '메뉴 이미지',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'description',
      title: '설명',
      type: 'string',
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
      name: 'isAvailable',
      title: '판매중',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      category: 'category.title',
      price: 'price',
      isAvailable: 'isAvailable',
      media: 'image',
    },

    prepare({ title, category, price, media, isAvailable }) {
      const status = !isAvailable ? ' · 판매중지' : '';

      return {
        title,
        subtitle: `${category ?? ''} · ${price ?? ''}${status}`,
        media,
      };
    },
  },
});
