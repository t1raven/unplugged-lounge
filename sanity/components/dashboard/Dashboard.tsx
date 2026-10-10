'use client';

import { useEffect, useState } from 'react';
import { useClient, useCurrentUser, useWorkspace } from 'sanity';
import { getStudioRole, isSuperAdmin } from '@/sanity/studioAccess';
import { Box, Card, Grid, Heading, Stack, Text } from '@sanity/ui';

import RecentPerformanceList from './RecentPerformanceList';
import UpcomingPerformanceList from './UpcomingPerformanceList';
import RecentOrderList from './RecentOrderList';
import QuickActions from './QuickActions';

type Stats = {
  todayPerformances: number;
  upcomingPerformances: number;
  recentOrders: number;
  pendingOrders: number;
};

export default function Dashboard() {
  const client = useClient({
    apiVersion: '2026-08-13',
  });
  const user = useCurrentUser();
  const { basePath } = useWorkspace();
  const [access, setAccess] = useState<{
    user: typeof user;
    client: typeof client;
    allowed: boolean;
  } | null>(null);
  const allowed = access?.user === user && access?.client === client && access.allowed;

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const role = await getStudioRole(client, user);
        if (!active) return;

        const allowed = isSuperAdmin(role);
        setAccess({ user, client, allowed });

        if (!allowed) {
          window.location.replace(`${basePath.replace(/\/+$/, '')}/structure`);
          return;
        }

        const data = await client.fetch<Stats>(
          `
      {
        "todayPerformances": count(*[_type == "performance" && date >= $todayStart&& date < $tomorrowStart]),
        "upcomingPerformances": count(*[_type == "performance" && date >= $tomorrowStart]),
        "recentOrders": count(*[_type == "purchaseOrder" && _createdAt >= dateTime(now()) - 60 * 60 * 24 * 7]),
        "pendingOrders": count(*[_type == "purchaseOrder" && status == "pending"])
      }
    `,
          {
            todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
            tomorrowStart: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        );
        if (active) setStats(data);
      } catch (error) {
        if (active) {
          console.error('대시보드 조회 실패:', error);
          setAccess({ user, client, allowed: false });
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [client, user, basePath]);

  if (!allowed) return null;

  const items = [
    { title: '오늘 공연', value: stats?.todayPerformances },
    { title: '다가오는 공연', value: stats?.upcomingPerformances },
    { title: '최근 7일 주문', value: stats?.recentOrders },
    { title: '주문신청 대기', value: stats?.pendingOrders },
  ];

  return (
    <Box padding={4} paddingTop={5}>
      <Stack gap={5}>
        <Stack gap={4}>
          <Heading size={3}>Dashboard</Heading>
          <Text muted size={1}>
            UNPLUGGED LOUNGE 운영 현황
          </Text>
        </Stack>

        <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
          {items.map((item) => (
            <Card key={item.title} padding={4} radius={3} border tone="primary">
              <Stack gap={4}>
                <Text muted size={1}>
                  {item.title}
                </Text>

                <Heading size={3}>{item.value?.toLocaleString() ?? '—'}</Heading>
              </Stack>
            </Card>
          ))}
        </Grid>

        <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
          <RecentPerformanceList />
          <UpcomingPerformanceList />
          <RecentOrderList />
        </Grid>

        <QuickActions />
      </Stack>
    </Box>
  );
}
