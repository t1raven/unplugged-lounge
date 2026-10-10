'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Card, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';
import type { BadgeProps } from '@sanity/ui';

type RecentOrder = {
  _id: string;
  _createdAt: string;
  customer: {
    name?: string;
  };
  totalPrice?: number;
  status?: string;
};

const QUERY = `
  *[
    _type == "purchaseOrder" &&
    !(_id in path("drafts.**"))
  ]
  | order(_createdAt desc)[0...7] {
    _id,
    _createdAt,
    customer,
    totalPrice,
    status
  }
`;

const STATUS: Record<string, { label: string; tone: BadgeProps['tone'] }> = {
  pending: {
    label: '신청',
    tone: 'caution',
  },
  confirmed: {
    label: '확인',
    tone: 'positive',
  },
  paid: {
    label: '입금 완료',
    tone: 'primary',
  },
  inTransit: {
    label: '배송 중',
    tone: 'primary',
  },
  completed: {
    label: '수령완료',
    tone: 'positive',
  },
  cancelled: {
    label: '주문 취소',
    tone: 'critical',
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

export default function RecentOrderList() {
  const client = useClient({
    apiVersion: '2026-08-13',
  });

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await client.fetch<RecentOrder[]>(QUERY);

      setOrders(result);
      setError(false);
    } catch (err) {
      console.error('최근 주문 조회 실패:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 0);

    const subscription = client
      .listen(
        '*[_type == "purchaseOrder"]',
        {},
        {
          includeResult: false,
          visibility: 'query',
        },
      )
      .subscribe({
        next: () => void fetchOrders(),
        error: (err) => console.error(err),
      });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [client, fetchOrders]);

  return (
    <Card padding={4} border radius={3}>
      <Stack gap={4}>
        <Flex align="center" justify="space-between">
          <Heading size={2}>최근 주문</Heading>
          <Badge>최근 {orders.length}건</Badge>
        </Flex>

        {loading ? (
          <Flex justify="center" padding={5}>
            <Spinner />
          </Flex>
        ) : error ? (
          <Box paddingY={4}>
            <Text muted size={1}>
              최근 주문을 불러오지 못했습니다.
            </Text>
          </Box>
        ) : orders.length === 0 ? (
          <Box paddingY={4}>
            <Text muted size={1}>
              등록된 주문이 없습니다.
            </Text>
          </Box>
        ) : (
          <Stack gap={2}>
            {orders.map((order) => {
              const status = STATUS[order.status ?? ''] ?? {
                label: order.status || '상태 미정',
                tone: 'default' as const,
              };

              return (
                <Card key={order._id} border radius={2} overflow="hidden">
                  <IntentLink
                    intent="edit"
                    params={{
                      id: order._id,
                      type: 'purchaseOrder',
                    }}
                    style={{
                      display: 'block',
                      color: 'inherit',
                      textDecoration: 'none',
                      padding: 14,
                    }}
                  >
                    <Flex align="center" justify="space-between" gap={3}>
                      <Box flex={1} style={{ minWidth: 0 }}>
                        <Stack gap={3}>
                          <Text size={1} weight="semibold" textOverflow="ellipsis">
                            {order.customer?.name || '이름 없음'}
                          </Text>

                          <Text size={1} muted>
                            {formatDate(order._createdAt)}
                          </Text>
                        </Stack>
                      </Box>

                      <Stack gap={3}>
                        <Text size={1} weight="semibold" align="right">
                          {(order.totalPrice ?? 0).toLocaleString('ko-KR')}원
                        </Text>

                        <Flex justify="flex-end">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </Flex>
                      </Stack>
                    </Flex>
                  </IntentLink>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
