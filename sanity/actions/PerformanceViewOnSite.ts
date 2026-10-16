import { useEffect, useState } from 'react';
import { useClient, type DocumentActionComponent } from 'sanity';
import { LaunchIcon } from '@sanity/icons/Launch';
import { API_VERSION } from '@/sanity/structure/types';

export const PerformanceViewOnSiteAction: DocumentActionComponent = ({ draft, published }) => {
  const client = useClient({ apiVersion: API_VERSION });
  const [siteUrl, setSiteUrl] = useState('');

  const doc = published ?? draft;
  const slug = (doc?.slug as { current?: string } | undefined)?.current;

  useEffect(() => {
    let active = true;

    client
      .fetch<string | null>(
        `*[_type == "siteSettings" && _id == "siteSettings"][0].general.siteUrl`,
      )
      .then((url) => {
        if (active) setSiteUrl((url ?? '').trim().replace(/\/+$/, ''));
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [client]);

  return {
    label: '게시물 바로가기',
    icon: LaunchIcon,
    disabled: !published || !slug || !siteUrl,
    title: !published
      ? '게시물을 먼저 발행해주세요.'
      : !slug
        ? '슬러그가 없습니다.'
        : !siteUrl
          ? '사이트 URL을 불러오지 못했거나 설정되지 않았습니다.'
          : '사이트에서 게시물 보기',
    onHandle: () => {
      if (!published || !slug || !siteUrl) return;

      const url = `${siteUrl}/performances/${encodeURIComponent(slug)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  };
};
