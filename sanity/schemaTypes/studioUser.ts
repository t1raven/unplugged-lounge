import { defineField, defineType } from 'sanity';

export const studioUser = defineType({
  name: 'studioUser',
  title: '관리자 계정',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: '이름',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'email',
      title: '이메일',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),

    defineField({
      name: 'role',
      title: '관리 권한',
      type: 'string',

      options: {
        list: [
          {
            title: '최고관리자',
            value: 'superAdmin',
          },
          {
            title: '공연관리자',
            value: 'performanceManager',
          },
          {
            title: '아카이브관리자',
            value: 'galleryManager',
          },
          {
            title: '카페관리자',
            value: 'cafeManager',
          },
          {
            title: '굿즈관리자',
            value: 'goodsManager',
          },
        ],
        direction: 'horizontal',
        layout: 'radio',
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'enabled',
      title: '사용 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      role: 'role',
      enabled: 'enabled',
    },

    prepare({ title, subtitle, role, enabled }) {
      const roleLabel = {
        superAdmin: '최고관리자',
        performanceManager: '공연관리자',
        galleryManager: '아카이브관리자',
        cafeManager: '카페관리자',
        goodsManager: '굿즈관리자',
      }[role as string];

      return {
        title,
        subtitle: `${subtitle} · ${roleLabel ?? ''}` + (enabled === false ? ' · 사용중지' : ''),
      };
    },
  },
});
