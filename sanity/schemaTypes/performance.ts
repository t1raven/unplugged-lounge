import { defineField, defineType } from 'sanity';
import { PerformanceTimeInput, SalesTimeInput } from '../components/ui/SelectTimeInput';

export const performance = defineType({
  name: 'performance',
  title: '공연 일정',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: '공연명',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'date',
      title: '공연 일시',
      type: 'datetime',
      components: {
        input: PerformanceTimeInput,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: '슬러그',
      type: 'slug',
      options: {
        source: (doc) => {
          const dateStr = typeof doc.date === 'string' ? doc.date.split('T')[0] : '';
          const titleStr = typeof doc.title === 'string' ? doc.title : '';
          return dateStr ? `${dateStr}-${titleStr}` : titleStr;
        },
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-가-힣]/g, '')
            .replace(/-+/g, '-')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'siteSalesOnly',
      title: '현장예매만 가능',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'reservationOpen',
      title: '예매 가능',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'salesOpen',
      title: '예매 오픈',
      type: 'datetime',
      components: {
        input: SalesTimeInput,
      },
      hidden: ({ document }) => !!document?.siteSalesOnly,
    }),

    defineField({
      name: 'salesClose',
      title: '예매 마감',
      type: 'datetime',
      components: {
        input: SalesTimeInput,
      },
      hidden: ({ document }) => !!document?.siteSalesOnly,
    }),

    defineField({
      name: 'place',
      title: '장소',
      type: 'reference',
      to: [
        {
          type: 'place',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'poster',
      title: '공연 포스터',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'artists',
      title: '라인업',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'artist',
            },
          ],
        },
      ],
      //validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'price1',
      title: '사전 예매 가격',
      type: 'number',
      validation: (Rule) => Rule.min(0),
      hidden: ({ document }) => !!document?.siteSalesOnly,
    }),

    defineField({
      name: 'price1Option',
      title: '사전 예매 가격 옵션',
      type: 'string',
      hidden: ({ document }) => !!document?.siteSalesOnly,
    }),

    defineField({
      name: 'price2',
      title: '현장 예매 가격',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: 'price2Option',
      title: '현장 예매 가격 옵션',
      type: 'string',
    }),

    defineField({
      name: 'admissionType',
      title: '입장 방식',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: '입장번호순', value: '1' },
          { title: '공연장대기순', value: '2' },
        ],
      },
      initialValue: '1',
    }),

    defineField({
      name: 'viewingType',
      title: '관람 방식',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: '좌석', value: '1' },
          { title: '입석', value: '2' },
        ],
      },
      initialValue: '1',
    }),

    defineField({
      name: 'description',
      title: '공연 소개',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),

    defineField({
      name: 'notice',
      title: '공지 사항',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),

    defineField({
      name: 'reservationUrl',
      title: '예매 신청 URL',
      type: 'url',
      hidden: ({ document }) => !!document?.siteSalesOnly,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      date: 'date',
      open: 'reservationOpen',
      siteOnly: 'siteSalesOnly',
      media: 'poster',
    },

    prepare({ title, date, media, open, siteOnly }) {
      const getDate = new Date(date);

      const year = getDate.getFullYear();
      const month = String(getDate.getMonth() + 1).padStart(2, '0');
      const day = String(getDate.getDate()).padStart(2, '0');

      const weekday = ['일', '월', '화', '수', '목', '금', '토'][getDate.getDay()];

      const hours = String(getDate.getHours()).padStart(2, '0');

      const minutes = String(getDate.getMinutes()).padStart(2, '0');

      const status = !open && !siteOnly ? ' · 매진' : '';

      return {
        title,
        subtitle: `${year}-${month}-${day} (${weekday}) ${hours}:${minutes}${status}`,
        media,
      };
    },
  },

  orderings: [
    {
      title: '공연 날짜 순',
      name: 'orderDesc',
      by: [
        {
          field: 'date',
          direction: 'desc',
        },
      ],
    },
  ],
});
