import { defineField, defineType } from 'sanity';

export const place = defineType({
  name: 'place',
  title: '공연 장소',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: '장소명',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'address',
      title: '주소',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'naverMap',
      title: '네이버 지도 URL',
      type: 'url',
    }),

    defineField({
      name: 'kakaomMap',
      title: '카카오 지도 URL',
      type: 'url',
    }),

    defineField({
      name: 'googleMap',
      title: '구글 지도 URL',
      type: 'url',
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
      name: 'color',
      title: '고유 색상',
      type: 'color',
      options: {
        // 투명도 조절 비활성화 (선택 사항)
        disableAlpha: true,
        // 자주 쓰는 색상 프리셋 지정 (선택 사항)
        colorList: ['#EE7102', '#4EAEE3', '#4CD964', '#FF3D30', '#FFCD3F'],
      },
    }),
  ],

  preview: {
    select: {
      title: 'name',
    },
  },
});
