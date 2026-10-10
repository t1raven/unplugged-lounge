import { NextRequest, NextResponse } from 'next/server';

import { client } from '@/sanity/lib/client';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') || '';

  const listQuery = `
    *[
      _type == "menuItem"
      ${category ? `&& category->slug.current == $category` : ''}
      && isAvailable == true
    ]
    | order(orderRank) {
      _id,
      name,
      description,
      price,
      label,

      "category": category->{
        _id,
        title,
        "slug": slug.current
      },

      "imageUrl": image.asset->url
    }
  `;

  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  if (!category) {
    return NextResponse.json({
      items: [],
      hasMore: false,
    });
  }

  const items = await client.fetch(listQuery, {
    category,
    start,
    end,
  });

  return NextResponse.json({
    items,
    hasMore: items.length === PAGE_SIZE,
  });
}
