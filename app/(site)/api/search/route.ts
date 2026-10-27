import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  const searchQuery = `
  *[
    _type in ["performance", "artist"] &&
    (
      title match $keyword ||
      name match $keyword
    )
  ] | order(date desc) {
    _id,
    _type,
    "title": coalesce(title, name),
    date,
    "slug": slug.current
  }
`;

  const keyword = (request.nextUrl.searchParams.get('q') ?? '').trim();

  if (!keyword) {
    return NextResponse.json([]);
  }

  const results = await client.fetch(searchQuery, {
    keyword: `*${keyword}*`,
  });

  return NextResponse.json(results);
}
