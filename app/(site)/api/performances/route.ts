import { NextRequest, NextResponse } from 'next/server';

import { client } from '@/sanity/lib/client';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'past';
  if (type !== 'today' && type !== 'upcoming' && type !== 'past') {
    return NextResponse.json({ error: 'Invalid performance type' }, { status: 400 });
  }
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const todayStart = new Date(`${today}T00:00:00+09:00`);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const dateFilter = {
    today: 'dateTime(date) >= dateTime($todayStart) && dateTime(date) < dateTime($tomorrowStart)',
    upcoming: 'dateTime(date) >= dateTime($todayStart)',
    past: 'dateTime(date) < dateTime($todayStart)',
  }[type];
  const order = type === 'past' ? 'desc' : 'asc';

  const query = `
    *[
      _type == "performance"
      && defined(date)
      && ${dateFilter}
      && isPrivate == false
    ]
    | order(date ${order}, _id asc)
    [$start...$end] {
      _id,
      title,
      slug,
      date,
      poster,
      artists[]->{
        _id,
        name,
        slug
      },
    }
  `;

  const items = await client.fetch(query, {
    todayStart: todayStart.toISOString(),
    tomorrowStart: tomorrowStart.toISOString(),
    start,
    end,
  });

  return NextResponse.json({
    items,
    hasMore: items.length === PAGE_SIZE,
    page,
  });
}
