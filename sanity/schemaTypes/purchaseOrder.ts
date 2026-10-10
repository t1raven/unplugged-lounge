import { defineField, defineType } from 'sanity';

export const purchaseOrder = defineType({
  name: 'purchaseOrder',
  title: '굿즈 주문내역',
  type: 'document',

  fields: [
    defineField({
      name: 'orderNumber',
      title: '주문번호',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'createdAt',
      title: '주문일시',
      type: 'datetime',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'deliveryMethod',
      title: '배송방법',
      type: 'string',

      options: {
        list: [
          {
            title: '배송',
            value: 'delivery',
          },
          {
            title: '픽업',
            value: 'pickup',
          },
        ],
        direction: 'horizontal',
        layout: 'radio',
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'customer',
      title: '구매자 정보',
      type: 'object',

      fields: [
        {
          name: 'name',
          title: '이름',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },

        {
          name: 'phone',
          title: '연락처',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },

        {
          name: 'address',
          title: '배송지',
          type: 'object',

          fields: [
            {
              name: 'postcode',
              title: '우편번호',
              type: 'string',
            },

            {
              name: 'address',
              title: '주소',
              type: 'string',
            },

            {
              name: 'detailAddress',
              title: '상세주소',
              type: 'string',
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'items',
      title: '구매 상품',
      type: 'array',

      validation: (Rule) => Rule.required().min(1),

      of: [
        {
          type: 'object',
          name: 'purchaseOrderItem',
          title: '구매 상품',

          fields: [
            {
              name: 'goods',
              title: '상품',
              type: 'reference',
              to: [
                {
                  type: 'goodsItem',
                },
              ],
            },

            {
              name: 'goodsId',
              title: '상품 ID',
              type: 'string',
              readOnly: true,
            },

            {
              name: 'name',
              title: '상품명',
              type: 'string',
              readOnly: true,
              validation: (Rule) => Rule.required(),
            },

            {
              name: 'options',
              title: '선택 옵션',
              type: 'array',

              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'name',
                      title: '옵션명',
                      type: 'string',
                    },

                    {
                      name: 'value',
                      title: '옵션값',
                      type: 'string',
                    },
                  ],

                  preview: {
                    select: {
                      name: 'name',
                      value: 'value',
                    },

                    prepare({ name, value }) {
                      return {
                        title: `${name}: ${value}`,
                      };
                    },
                  },
                },
              ],
            },

            {
              name: 'originalPrice',
              title: '정상가',
              type: 'number',
              readOnly: true,
            },

            {
              name: 'price',
              title: '실제 구매 단가',
              type: 'number',
              readOnly: true,
              validation: (Rule) => Rule.required().min(0),
            },

            {
              name: 'quantity',
              title: '수량',
              type: 'number',
              readOnly: true,
              validation: (Rule) => Rule.required().integer().min(1),
            },

            {
              name: 'subtotal',
              title: '상품 금액',
              type: 'number',
              readOnly: true,
              validation: (Rule) => Rule.required().min(0),
            },
          ],

          preview: {
            select: {
              name: 'name',
              quantity: 'quantity',
              subtotal: 'subtotal',
            },

            prepare({ name, quantity, subtotal }) {
              return {
                title: `${name} × ${quantity}`,
                subtitle: `${subtotal?.toLocaleString() ?? 0}원`,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: 'productPrice',
      title: '상품금액',
      type: 'number',
      readOnly: true,

      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'deliveryFee',
      title: '배송비',
      type: 'number',
      readOnly: true,

      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'totalPrice',
      title: '최종 결제금액',
      type: 'number',
      readOnly: true,

      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'memo',
      title: '요청사항',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'privacyAgreed',
      title: '개인정보 수집·이용 동의',
      type: 'boolean',
      readOnly: true,
    }),

    defineField({
      name: 'privacyAgreedAt',
      title: '개인정보 동의 일시',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'status',
      title: '주문 상태',
      type: 'string',

      initialValue: 'pending',

      options: {
        list: [
          {
            title: '신청',
            value: 'pending',
          },
          {
            title: '확인',
            value: 'confirmed',
          },
          {
            title: '입금완료',
            value: 'paid',
          },
          {
            title: '배송중',
            value: 'inTransit',
          },
          {
            title: '수령완료',
            value: 'completed',
          },
          {
            title: '취소',
            value: 'cancelled',
          },
        ],
        direction: 'horizontal',
        layout: 'radio',
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sheetSynced',
      title: 'Google Sheets 동기화',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),

    defineField({
      name: 'sheetSyncedAt',
      title: 'Google Sheets 동기화 시간',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'sheetSyncError',
      title: 'Google Sheets 오류',
      type: 'text',
      readOnly: true,
      hidden: ({ document }) => document?.sheetSynced === true,
    }),
  ],

  orderings: [
    {
      title: '최근 주문순',
      name: 'createdAtDesc',
      by: [
        {
          field: 'createdAt',
          direction: 'desc',
        },
      ],
    },

    {
      title: '오래된 주문순',
      name: 'createdAtAsc',
      by: [
        {
          field: 'createdAt',
          direction: 'asc',
        },
      ],
    },
  ],

  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customer.name',
      totalPrice: 'totalPrice',
      deliveryMethod: 'deliveryMethod',
      status: 'status',
    },

    prepare({ orderNumber, customerName, deliveryMethod, totalPrice, status }) {
      const deliveryLabel = deliveryMethod === 'delivery' ? '배송' : '픽업';

      const statusLabels: Record<string, string> = {
        pending: '신청',
        confirmed: '확인',
        paid: '입금완료',
        inTransit: '배송중',
        completed: '수령완료',
        cancelled: '취소',
      };

      return {
        title: `${orderNumber} · ${customerName}`,
        subtitle: [
          deliveryLabel,

          `${totalPrice?.toLocaleString() ?? 0}원`,

          statusLabels[status] ?? status,
        ].join(' · '),
      };
    },
  },
});
