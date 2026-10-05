'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import ModalScroll from '@/components/common/ModalScroll';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/utils/formatPhone';
import type { OrderTrackingResult, OrderStatus } from '@/types/order';

import './Tracking.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '신청',
  confirmed: '확인',
  paid: '입금완료',
  inTransit: '배송중',
  completed: '수령완료',
  cancelled: '취소',
};

const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'paid'];

export default function OrderTrackingModal({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<OrderTrackingResult[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = orders.find((order) => order.orderNumber === selectedOrderNumber) ?? null;

  const handleBack = () => {
    setError(null);

    if (selectedOrderNumber) {
      setSelectedOrderNumber(null);
      return;
    }

    setHasSearched(false);
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panelRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedOrderNumber) setSelectedOrderNumber(null);
        else if (hasSearched) setHasSearched(false);
        else onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasSearched, open, onClose, selectedOrderNumber]);

  if (!open) return null;

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSelectedOrderNumber(null);

    try {
      const response = await fetch('/api/orders/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = (await response.json()) as {
        orders?: OrderTrackingResult[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? '주문을 조회하지 못했습니다.');
      }

      setOrders(data.orders ?? []);
      setHasSearched(true);
    } catch (searchError) {
      setOrders([]);
      setHasSearched(false);
      setError(searchError instanceof Error ? searchError.message : '주문을 조회하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || cancelling) return;
    if (!window.confirm('이 주문을 취소하시겠습니까?')) return;

    setCancelling(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber,
          name,
          phone,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? '주문을 취소하지 못했습니다.');
      }

      setOrders((current) =>
        current.map((order) =>
          order.orderNumber === selectedOrder.orderNumber
            ? { ...order, status: 'cancelled' }
            : order,
        ),
      );
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : '주문을 취소하지 못했습니다.');
    } finally {
      setCancelling(false);
      window.alert('주문이 취소되었습니다.');
    }
  };

  return (
    <div
      className="order-tracking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-title"
      data-lenis-prevent
    >
      <button
        className="order-tracking-backdrop"
        type="button"
        onClick={onClose}
        aria-label="주문조회 닫기"
      />
      <div className="order-tracking-panel" ref={panelRef} tabIndex={-1}>
        <header className="order-tracking-header">
          {selectedOrder || hasSearched ? (
            <button
              type="button"
              className="order-tracking-icon"
              onClick={handleBack}
              aria-label={selectedOrder ? '주문 목록으로 돌아가기' : '주문 조회로 돌아가기'}
            >
              <span className="material-symbols-rounded">arrow_back_ios</span>
            </button>
          ) : (
            <span />
          )}
          <h2 id="order-tracking-title">
            {selectedOrder ? '주문 상세' : hasSearched ? '주문 목록' : '주문 조회'}
          </h2>
          <button
            type="button"
            className="order-tracking-icon"
            onClick={onClose}
            aria-label="주문조회 닫기"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </header>

        {selectedOrder ? (
          <OrderDetail
            order={selectedOrder}
            cancelling={cancelling}
            error={error}
            onCancel={handleCancel}
          />
        ) : hasSearched ? (
          <OrderList
            orders={orders}
            onSelect={(orderNumber) => {
              setSelectedOrderNumber(orderNumber);
              setError(null);
            }}
          />
        ) : (
          <div className="order-tracking-body">
            <form className="order-tracking-form" onSubmit={handleSearch}>
              <p>주문 시 입력한 이름과 연락처를 입력해주세요.</p>

              <TextField
                id="order-tracking-name"
                type="text"
                label="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required={true}
              />
              <TextField
                id="order-tracking-phone"
                type="tel"
                inputMode="numeric"
                label="연락처"
                value={phone}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                autoComplete="tel"
                maxLength={13}
                required={true}
              />

              <Button className="order-tracking-submit" type="submit" disabled={loading}>
                {loading ? '조회 중...' : '조회하기'}
              </Button>
            </form>

            {error && (
              <p className="order-tracking-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderList({
  orders,
  onSelect,
}: {
  orders: OrderTrackingResult[];
  onSelect: (orderNumber: string) => void;
}) {
  return (
    <ModalScroll>
      <div className="order-tracking-body">
        <section className="order-tracking-results" aria-live="polite">
          <h3>
            조회 결과 <span>{orders.length}</span>
          </h3>
          {orders.length === 0 ? (
            <p className="order-tracking-empty">일치하는 주문 내역이 없습니다.</p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.orderNumber}>
                  <button type="button" onClick={() => onSelect(order.orderNumber)}>
                    <div className="order-result-top">
                      <strong>{order.orderNumber}</strong>
                      <span className={`order-status ${order.status}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <time>{formatDate(order.createdAt)}</time>
                    <p>{getItemSummary(order)}</p>
                    <b>{order.totalPrice.toLocaleString()}원</b>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ModalScroll>
  );
}

function OrderDetail({
  order,
  cancelling,
  error,
  onCancel,
}: {
  order: OrderTrackingResult;
  cancelling: boolean;
  error: string | null;
  onCancel: () => void;
}) {
  const address = order.customer.address;
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <ModalScroll>
      <div className="order-detail">
        <div className="order-detail-summary">
          <div>
            <span>주문번호</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div>
            <span>주문일</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div>
            <span>상태</span>
            <strong className={`order-status ${order.status}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </strong>
          </div>
        </div>

        <section>
          <h3>주문 상품</h3>
          {order.items.map((item, index) => (
            <article className="order-detail-item" key={`${item.name}-${index}`}>
              <div>
                <strong>{item.name}</strong>
                {item.options?.length > 0 && (
                  <small>
                    {item.options.map((option) => `${option.name}: ${option.value}`).join(' / ')}
                  </small>
                )}
                <span>
                  {item.quantity}개 × {item.price.toLocaleString()}원
                </span>
              </div>
              <b>{item.subtotal.toLocaleString()}원</b>
            </article>
          ))}
        </section>

        <section>
          <h3>배송 및 연락처</h3>
          <dl>
            <div>
              <dt>수령 방법</dt>
              <dd>{order.deliveryMethod === 'delivery' ? '배송' : '픽업'}</dd>
            </div>
            <div>
              <dt>주문자</dt>
              <dd>{order.customer.name}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{order.customer.phone}</dd>
            </div>
            {order.deliveryMethod === 'delivery' && address && (
              <div>
                <dt>배송지</dt>
                <dd>
                  [{address.postcode}] {address.address} {address.detailAddress}
                </dd>
              </div>
            )}
            {order.memo && (
              <div>
                <dt>요청사항</dt>
                <dd>{order.memo}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="order-detail-price">
          <div>
            <span>상품금액</span>
            <span>{order.productPrice.toLocaleString()}원</span>
          </div>
          <div>
            <span>배송비</span>
            <span>{order.deliveryFee.toLocaleString()}원</span>
          </div>
          <div className="total">
            <span>총 주문금액</span>
            <strong>
              {order.totalPrice.toLocaleString()}
              <small>원</small>
            </strong>
          </div>
        </section>

        {error && (
          <p className="order-tracking-error" role="alert">
            {error}
          </p>
        )}
        {canCancel && (
          <Button
            className="order-cancel-button"
            color="error"
            onClick={onCancel}
            disabled={cancelling}
          >
            {cancelling ? '취소 처리 중...' : '주문 취소'}
          </Button>
        )}
        {!canCancel && order.status !== 'cancelled' && (
          <p className="order-cancel-guide">배송중 후에는 주문을 취소할 수 없습니다.</p>
        )}
      </div>
    </ModalScroll>
  );
}

function getItemSummary(order: OrderTrackingResult) {
  const firstItem = order.items[0];
  if (!firstItem) return '상품 정보 없음';
  return order.items.length > 1
    ? `${firstItem.name} 외 ${order.items.length - 1}건`
    : firstItem.name;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
