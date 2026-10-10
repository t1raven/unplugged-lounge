'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Card, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';

type UpcomingPerformance = {
  _id: string;
  title?: string;
  date: string;
  posterUrl?: string;
};

const QUERY = `
  *[
    _type == "performance" &&
    defined(date) &&
    dateTime(date) >= dateTime($now) &&
    !(_id in path("drafts.**"))
  ]
  | order(date asc)[0...5] {
    _id,
    title,
    date,
    "posterUrl": poster.asset->url
  }
`;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

function getDday(date: string, now: Date) {
  const kstDate = (value: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(value);

    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);

    return Date.UTC(get('year'), get('month') - 1, get('day'));
  };

  const diff = Math.round((kstDate(new Date(date)) - kstDate(now)) / 86400000);

  if (diff === 0) return 'D-DAY';
  return `D-${diff}`;
}

export default function UpcomingPerformanceList() {
  const client = useClient({
    apiVersion: '2026-08-13',
  }).withConfig({
    perspective: 'published',
    useCdn: false,
  });

  const [performances, setPerformances] = useState<UpcomingPerformance[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPerformances = useCallback(async () => {
    try {
      const currentTime = new Date();

      const result = await client.fetch<UpcomingPerformance[]>(QUERY, {
        now: currentTime.toISOString(),
      });

      setPerformances(result);
      setNow(currentTime);
      setError(false);
    } catch (err) {
      console.error('다가오는 공연 조회 실패:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      void fetchPerformances();
    }, 0);

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
        next: () => void fetchPerformances(),
        error: (err) => console.error(err),
      });

    // 시간이 지나 종료된 공연을 목록에서 제거
    const interval = setInterval(() => {
      void fetchPerformances();
    }, 60 * 1000);

    return () => {
      clearTimeout(initialFetch);
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [client, fetchPerformances]);

  return (
    <Card padding={4} border radius={3}>
      <Stack gap={4}>
        <Flex align="center" justify="space-between">
          <Heading size={2}>다가오는 공연</Heading>

          <Badge tone="default">{performances.length}개 공연</Badge>
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
              예정된 공연이 없습니다.
            </Text>
          </Box>
        ) : (
          <Stack gap={2}>
            {performances.map((performance) => (
              <Card key={performance._id} border radius={2} overflow="hidden">
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
                  <Flex align="center" gap={3}>
                    <Box
                      style={{
                        width: 56,
                        height: 72,
                        flexShrink: 0,
                        overflow: 'hidden',
                        borderRadius: 4,
                      }}
                    >
                      {performance.posterUrl && (
                        <img
                          src={performance.posterUrl}
                          alt=""
                          loading="lazy"
                          style={{
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
                          {formatDate(performance.date)}
                        </Text>
                      </Stack>
                    </Box>

                    {now && <Badge tone="caution">{getDday(performance.date, now)}</Badge>}
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
