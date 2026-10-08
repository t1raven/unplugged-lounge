import type { Metadata } from 'next';

import { client } from '@/sanity/lib/client';

import SubPageHero from '@/components/common/SubPageHero';
import RentalPage from '@/components/rental';

export const metadata: Metadata = {
  title: '공연·대관신청',
};

const equipmentQuery = '*[_type == "equipment" && _id == "equipment"][0]';

export default async function Rental() {
  const equipment = await client.fetch(equipmentQuery);

  return (
    <main id="site-body" className="rental">
      <SubPageHero
        label="PERFORMANCE · SPACE RENTAL APPLICATION"
        title="공연·대관신청"
        description="언플러그드 라운지는 공연과 음악을 위한 <br/>라이브 공간을 제공합니다."
      />
      <RentalPage equipment={equipment} />
    </main>
  );
}
