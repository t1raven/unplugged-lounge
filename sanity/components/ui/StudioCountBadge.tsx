'use client';

import { Badge } from '@sanity/ui';

import { useStudioCounts } from '../providers/StudioCountProvider';

type CategoryType = 'menuItem' | 'galleryItem' | 'goodsItem';

type PerformanceType = 'today' | 'upcoming' | 'past';

type OrderStatus =
  'all' | 'pending' | 'confirmed' | 'paid' | 'inTransit' | 'completed' | 'cancelled';

function BadgeUI({ count }: { count: number }) {
  return (
    <Badge
      tone={count ? 'primary' : 'default'}
      style={{
        minWidth: '25px',
        width: 'auto',
        height: '25px',
        padding: '6px 0',
        borderRadius: '3px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {count ?? '…'}
    </Badge>
  );
}

export function PerformanceCountBadge({ type, year }: { type: PerformanceType; year?: number }) {
  const counts = useStudioCounts();

  return (
    <BadgeUI
      count={
        type === 'past' && year !== undefined
          ? (counts.performancePastByYear[year] ?? 0)
          : counts.performance[type]
      }
    />
  );
}

export function CategoryCountBadge({
  type,
  categoryId,
  year,
}: {
  type: CategoryType;
  categoryId: string;
  year?: number | 'other';
}) {
  const counts = useStudioCounts();

  //return <BadgeUI count={counts[type][categoryId] ?? 0} />
  return (
    <BadgeUI
      count={
        type === 'galleryItem' && year !== undefined
          ? (counts.galleryItemByYear[categoryId]?.[year] ?? 0)
          : (counts[type][categoryId] ?? 0)
      }
    />
  );
}

export function OrderCountBadge({ status }: { status: OrderStatus }) {
  const counts = useStudioCounts();

  return <BadgeUI count={counts.orders[status]} />;
}
