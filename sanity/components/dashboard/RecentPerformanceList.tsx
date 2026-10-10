'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Card, Flex, Box, Stack, Text, Heading, Spinner, Badge } from '@sanity/ui';

type RecentPerformance = {
  _id: string;
  _createdAt: string;
  title?: string;
  date?: string;
  posterUrl?: string;
};

const QUERY = `
  *[
    _type == "performance" &&
    !(_id in path("drafts.**"))
  ]
  | order(_createdAt desc)[0...5] {
    _id,
    _createdAt,
    title,
    date,
    "posterUrl": poster.asset->url
  }
`;

const formatDate = (date?: string) => {
  if (!date) return '-';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
};

export default function RecentPerformanceList() {
  const client = useClient({
    apiVersion: '2026-08-13',
  });

  const [performances, setPerformances] = useState<RecentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPerformances = useCallback(async () => {
    try {
      const result = await client.fetch<RecentPerformance[]>(QUERY);

      setPerformances(result);
      setError(false);
    } catch (err) {
      console.error('최근 공연 조회 실패:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (active) {
        await fetchPerformances();
      }
    };

    void load();

    const subscription = client
      .listen(
        '*[_type == "performance"]',
        {},
        {
          includeResult: false,
          visibility: 'query',
        },
      )
      .subscribe({
        next: () => {
          if (active) void load();
        },
        error: (err) => {
          console.error('공연 구독 오류:', err);
        },
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client, fetchPerformances]);

  return (
    <Card padding={4} border radius={3}>
      <Stack gap={4}>
        <Flex justify="space-between" align="center">
          <Heading size={2}>최근 등록 공연</Heading>

          <Badge>최근 {performances.length}개</Badge>
        </Flex>

        {loading ? (
          <Flex justify="center" padding={5}>
            <Spinner />
          </Flex>
        ) : error ? (
          <Text muted size={1}>
            공연 목록을 불러오지 못했습니다.
          </Text>
        ) : performances.length === 0 ? (
          <Box paddingY={4}>
            <Text muted size={1}>
              등록된 공연이 없습니다.
            </Text>
          </Box>
        ) : (
          <Stack gap={2}>
            {performances.map((performance) => (
              <Card key={performance._id} radius={2} border overflow="hidden">
                <IntentLink
                  intent="edit"
                  params={{
                    id: performance._id,
                    type: 'performance',
                  }}
                  style={{
                    display: 'block',
                    padding: 12,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Flex gap={3} align="center">
                    <Box
                      style={{
                        width: 56,
                        height: 72,
                        flexShrink: 0,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'var(--card-border-color)',
                      }}
                    >
                      {performance.posterUrl && (
                        <img
                          src={performance.posterUrl}
                          alt=""
                          loading="lazy"
                          style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </Box>

                    <Box flex={1} style={{ minWidth: 0 }}>
                      <Stack gap={3}>
                        <Text size={1} weight="semibold" textOverflow="ellipsis">
                          {performance.title || '공연명 없음'}
                        </Text>

                        <Text size={1} muted>
                          공연일: {formatDate(performance.date)}
                        </Text>

                        <Text size={0} muted>
                          등록일: {formatDate(performance._createdAt)}
                        </Text>
                      </Stack>
                    </Box>
                  </Flex>
                </IntentLink>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
