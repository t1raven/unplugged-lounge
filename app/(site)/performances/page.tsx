import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';

import SubPageHero from '@/components/common/SubPageHero';
import PerformanceList from '@/components/performances/List';

export const metadata: Metadata = {
  title: '공연 예매',
};

const performancesQuery = `
  *[
    _type == "performance"
    && defined(date)
  ]
  | order(date asc)
  {
    _id,
    title,
    slug,
    date,
    artists[]->{
      _id,
      name,
      slug
    },
    poster {
      asset
    },
  }
`;

async function getPerformances() {
  return await client.fetch(performancesQuery);
}

export const revalidate = 0;

export default async function PerformancesListPage() {
  const performances = await getPerformances();

  return (
    <main id="site-body">
      <SubPageHero
        label="Performances"
        title="공연 예매"
        description="언플러그드에서 펼쳐지는 <br/>다양한 라이브 공연을 만나보세요."
      />
      <PerformanceList performances={performances} />
    </main>
  );
}
