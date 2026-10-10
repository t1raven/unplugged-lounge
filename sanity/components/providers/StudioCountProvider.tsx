'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useClient } from 'sanity';

const API_VERSION = '2026-01-01';

type Counts = {
  performance: {
    today: number;
    upcoming: number;
    past: number;
    null: number;
  };

  performancePastByYear: Record<number, number>;

  menuItem: Record<string, number>;
  menuItemNull: number;

  galleryItem: Record<string, number>;
  galleryItemNull: number;
  galleryItemByYear: Record<string, Partial<Record<number | 'other', number>>>;

  goodsItem: Record<string, number>;
  goodsItemNull: number;

  orders: {
    all: number;
    pending: number;
    confirmed: number;
    paid: number;
    inTransit: number;
    completed: number;
    cancelled: number;
  };
};

const initialCounts: Counts = {
  performance: {
    today: 0,
    upcoming: 0,
    past: 0,
    null: 0,
  },

  performancePastByYear: {},

  menuItem: {},
  menuItemNull: 0,

  galleryItem: {},
  galleryItemNull: 0,
  galleryItemByYear: {},

  goodsItem: {},
  goodsItemNull: 0,

  orders: {
    all: 0,
    pending: 0,
    confirmed: 0,
    paid: 0,
    inTransit: 0,
    completed: 0,
    cancelled: 0,
  },
};

const StudioCountContext = createContext<Counts>(initialCounts);

export function StudioCountProvider({ children }: { children: React.ReactNode }) {
  const studioClient = useClient({ apiVersion: API_VERSION });
  const client = useMemo(
    () =>
      studioClient.withConfig({
        perspective: 'drafts',
        useCdn: false,
      }),
    [studioClient],
  );

  const [counts, setCounts] = useState<Counts>(initialCounts);

  const fetchCounts = useCallback(async () => {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);

    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const result = await client.fetch<{
      performance: Counts['performance'];
      performancePastDates: { date: string }[];

      menuItem: {
        categoryId: string;
        count: number;
      }[];
      menuItemNull: number;

      galleryItem: {
        categoryId: string;
        count: number;
      }[];
      galleryItemNull: number;
      galleryYearDates: { categoryId: string; date: string | null }[];

      goodsItem: {
        categoryId: string;
        count: number;
      }[];
      goodsItemNull: number;

      orders: Counts['orders'];
    }>(
      `
      {
        "performance": {
          "today": count(
            *[
              _type == "performance"
              && date >= $todayStart
              && date < $tomorrowStart
            ]
          ),

          "upcoming": count(
            *[
              _type == "performance"
              && date >= $tomorrowStart
            ]
          ),

          "past": count(
            *[
              _type == "performance"
              && date < $todayStart
            ]
          ),
          "null": count(
            *[
              _type == "performance"
              && !defined(dateTime(date))
            ]
          )
        },

        "performancePastDates": *[
          _type == "performance" && date < $todayStart
        ] {date},

        "menuItem":
          *[_type == "menuCategory"] {
            "categoryId": _id,

            "count": count(
              *[
                _type == "menuItem"
                && category._ref == ^._id
              ]
            )
          },
        
        "menuItemNull": count(*[_type == "menuItem" && !defined(category._ref)]),

        "galleryItem":
          *[_type == "galleryCategory"] {
            "categoryId": _id,

            "count": count(
              *[
                _type == "galleryItem"
                && category._ref == ^._id
              ]
            )
          },

        "galleryItemNull": count(*[_type == "galleryItem" && !defined(category._ref)]),

        "galleryYearDates": *[
          _type == "galleryItem"
          && defined(category._ref)
        ] {
          "categoryId": category._ref,
          "date": performanceDate
        },

        "goodsItem":
          *[_type == "goodsCategory"] {
            "categoryId": _id,

            "count": count(
              *[
                _type == "goodsItem"
                && category._ref == ^._id
              ]
            )
          },

        "goodsItemNull": count(*[_type == "goodsItem" && !defined(category._ref)]),

        "orders": {
          "all": count(
            *[_type == "purchaseOrder"]
          ),

          "pending": count(
            *[
              _type == "purchaseOrder"
              && status == "pending"
            ]
          ),

          "confirmed": count(
            *[
              _type == "purchaseOrder"
              && status == "confirmed"
            ]
          ),

          "paid": count(
            *[
              _type == "purchaseOrder"
              && status == "paid"
            ]
          ),

          "inTransit": count(
            *[
              _type == "purchaseOrder"
              && status == "inTransit"
            ]
          ),

          "completed": count(
            *[
              _type == "purchaseOrder"
              && status == "completed"
            ]
          ),

          "cancelled": count(
            *[
              _type == "purchaseOrder"
              && status == "cancelled"
            ]
          )
        }
      }
      `,
      {
        todayStart: todayStart.toISOString(),

        tomorrowStart: tomorrowStart.toISOString(),
      },
    );

    const menuItem = Object.fromEntries(
      result.menuItem.map(({ categoryId, count }) => [categoryId, count]),
    );

    const galleryItem = Object.fromEntries(
      result.galleryItem.map(({ categoryId, count }) => [categoryId, count]),
    );

    const goodsItem = Object.fromEntries(
      result.goodsItem.map(({ categoryId, count }) => [categoryId, count]),
    );

    // Same UTC year boundaries as the gallery document lists.
    const galleryItemByYear: Counts['galleryItemByYear'] = {};
    for (const { categoryId, date } of result.galleryYearDates) {
      const years = (galleryItemByYear[categoryId] ??= {});
      if (date === null || date === '') {
        years.other = (years.other ?? 0) + 1;
        continue;
      }
      const year = new Date(date).getUTCFullYear();
      if (!Number.isFinite(year)) continue;
      years[year] = (years[year] ?? 0) + 1;
    }

    // Use the same local calendar year as the past-performance lists.
    const performancePastByYear: Counts['performancePastByYear'] = {};
    for (const { date } of result.performancePastDates) {
      const year = new Date(date).getFullYear();
      if (!Number.isFinite(year)) continue;
      performancePastByYear[year] = (performancePastByYear[year] ?? 0) + 1;
    }

    setCounts({
      performance: result.performance,
      performancePastByYear,

      menuItem,
      menuItemNull: result.menuItemNull,

      galleryItem,
      galleryItemNull: result.galleryItemNull,
      galleryItemByYear,

      goodsItem,
      goodsItemNull: result.goodsItemNull,

      orders: result.orders,
    });
  }, [client]);

  useEffect(() => {
    // Defer the initial state update so the effect only starts the async sync.
    void Promise.resolve().then(() => fetchCounts());

    const types = [
      'performance',
      'menuItem',
      'menuCategory',
      'galleryItem',
      'galleryCategory',
      'goodsItem',
      'goodsCategory',
      'purchaseOrder',
    ];

    const subscription = client
      .listen(
        `
          *[
            _type in $types
          ]
        `,
        {
          types,
        },
        {
          includeResult: false,
          visibility: 'query',
        },
      )
      .subscribe(() => {
        fetchCounts();
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, fetchCounts]);

  const value = useMemo(() => counts, [counts]);

  return <StudioCountContext.Provider value={value}>{children}</StudioCountContext.Provider>;
}

export function useStudioCounts() {
  return useContext(StudioCountContext);
}
