'use client';

import { Button } from '@/components/ui/Button';

interface Props {
  orderNumber: string | null;

  onClose: () => void;
}

export default function Complete({ orderNumber, onClose }: Props) {
  return (
    <div className="order-complete">
      <div className="complete-icon">
        <span className="material-symbols-rounded">check</span>
      </div>

      <h2>구매 신청이 완료되었습니다.</h2>

      {orderNumber && (
        <div className="complete-order-number">
          <span>주문번호</span>

          <strong>{orderNumber}</strong>
        </div>
      )}

      <p>신청 내용을 확인한 후 안내드리겠습니다.</p>

      <Button onClick={onClose}>확인</Button>
    </div>
  );
}
