'use client';

import type { ReactNode } from 'react';
import { IntentLink } from 'sanity/router';
import { AddCircleIcon } from '@sanity/icons/AddCircle';
import { ImagesIcon } from '@sanity/icons/Images';
import { PackageIcon } from '@sanity/icons/Package';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { CogIcon } from '@sanity/icons/Cog';
import { BottleIcon } from '@sanity/icons/Bottle';

import { Card, Stack, Flex, Grid, Text, Heading, Box } from '@sanity/ui';

type Action = {
  title: string;
  description: string;
  icon: ReactNode;
  type: string;
};

const createActions: Action[] = [
  {
    title: '공연 등록',
    description: '새 공연 일정 추가',
    icon: <CalendarIcon />,
    type: 'performance',
  },
  {
    title: '아카이브 등록',
    description: '사진 및 기록 추가',
    icon: <ImagesIcon />,
    type: 'galleryItem',
  },
  {
    title: '카페 메뉴 등록',
    description: '새로운 카페 메뉴 추가',
    icon: <BottleIcon />,
    type: 'menuItem',
  },
  {
    title: '굿즈 등록',
    description: '새로운 상품 추가',
    icon: <PackageIcon />,
    type: 'goodsItem',
  },
];

const linkStyle: React.CSSProperties = {
  display: 'block',
  height: '100%',
  color: 'inherit',
  textDecoration: 'none',
};

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card padding={4} border radius={2} height="fill" tone="default" style={{ height: '100%' }}>
      <Stack gap={4}>
        <Box>
          <Text size={3}>{icon}</Text>
        </Box>

        <Stack gap={3}>
          <Text size={1} weight="semibold">
            {title}
          </Text>
          <Text size={1} muted>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function QuickActions() {
  return (
    <Card padding={4} border radius={3}>
      <Stack gap={4}>
        <Flex align="center" gap={2}>
          <AddCircleIcon />
          <Heading size={2}>빠른 메뉴</Heading>
        </Flex>

        <Grid gridTemplateColumns={[1, 1, 5]} gap={3}>
          {createActions.map((action) => (
            <IntentLink
              key={action.type}
              intent="create"
              params={{ type: action.type }}
              style={linkStyle}
            >
              <ActionCard
                icon={action.icon}
                title={action.title}
                description={action.description}
              />
            </IntentLink>
          ))}

          <IntentLink
            intent="edit"
            params={{
              id: 'siteSettings',
              type: 'siteSettings',
            }}
            style={linkStyle}
          >
            <ActionCard
              icon={<CogIcon />}
              title="사이트 설정"
              description="사이트 운영 정보 수정"
            />
          </IntentLink>
        </Grid>
      </Stack>
    </Card>
  );
}
