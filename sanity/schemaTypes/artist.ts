import { defineField, defineType } from 'sanity';
import InstagramInput from '../components/ui/InstagramInput';

export const artist = defineType({
  name: 'artist',
  title: '아티스트',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: '아티스트명',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: '슬러그',
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
      name: 'bio',
      title: '아티스트 소개',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),

    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',

      components: {
        input: InstagramInput,
      },

      description: '@instagram_id 또는 Instagram 주소를 입력하세요.',
    }),

    defineField({
      name: 'youtube',
      title: 'YouTube',
      type: 'url',
    }),

    defineField({
      name: 'website',
      title: '웹사이트',
      type: 'url',
    }),
  ],

  preview: {
    select: {
      title: 'name',
    },
  },
});
