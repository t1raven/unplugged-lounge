import { defineField, defineType } from 'sanity';

export const equipment = defineType({
  name: 'equipment',
  title: '공연 장비',
  type: 'document',

  fields: [
    defineField({
      name: 'list',
      title: '장비 목록',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: '라벨',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: '타이틀',
              type: 'string',
            }),
            defineField({
              name: 'items',
              title: '장비',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                layout: 'list',
              },
              description: '예: 무선 x2 (BETA 58a), 건반 (Yamaha MX88)',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'label',
            },
          },
        },
      ],
    }),

    defineField({
      name: 'cautions',
      title: '주의사항',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'list',
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: '공연 장비',
        subtitle: '공연 장비 목록',
      };
    },
  },
});
