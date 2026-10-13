'use client';

import type { Performance } from '@/types/performance';

interface Props {
  performances: Performance[];
}

export default function PerformanceDatePicker({ performances }: Props) {
  return (
    <div className="performance-datePicker-container">
      {/* DatePicker component content goes here */}
    </div>
  );
}
