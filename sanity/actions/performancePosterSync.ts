import { useState } from 'react';
import { LexoRank } from 'lexorank';
import {
  type DocumentActionComponent,
  type SanityClient,
  type SanityDocument,
  useClient,
  useDocumentOperation,
} from 'sanity';

import { formatDateTime } from '@/utils/date';
import { apiVersion } from '../env';

const POSTER_CATEGORY_ID = 'b357b289-48b0-4924-b0ef-7ee003296edf';
const POSTER_CATEGORY_SLUG = '공연';
const POSTER_CATEGORY_TITLE = '공연';

const PUBLISH_CHECK_INTERVAL = 250;
const PUBLISH_CHECK_ATTEMPTS = 20;

type PerformanceDocument = SanityDocument & {
  title?: string;
  date?: string;
  poster?: {
    _type?: 'image';
    asset?: {
      _type?: 'reference';
      _ref?: string;
    };
    [key: string]: unknown;
  };
  artists?: Array<{
    _type?: 'reference';
    _ref?: string;
  }>;
};

/**
 * drafts.xxx → xxx
 */
function publishedId(id: string) {
  return id.replace(/^drafts\./, '');
}

/**
 * Performance와 1:1 대응되는 Gallery document ID
 */
function galleryIdFor(performanceId: string) {
  return `performance-poster-${performanceId}`;
}

/**
 * Gallery description 생성
 */
function galleryDescription(date: string, artistNames: string[]) {
  const artists = artistNames.filter(Boolean).join(' · ') || '미정';

  return [`아티스트: ${artists}`, `공연 일시: ${formatDateTime(date)}`].join('\n');
}

function normalizeArtistRefs(artists?: PerformanceDocument['artists']) {
  return (artists ?? [])
    .map((artist) => artist?._ref)
    .filter((ref): ref is string => Boolean(ref))
    .sort();
}

/**
 * publish 완료 후 실제 published document가
 * draft와 동일한 revision의 내용을 가지게 될 때까지 기다린다.
 *
 * Sanity publish는 비동기 operation이므로
 * 기존 published document가 존재하는 경우
 * 단순 getDocument()만으로는 이전 데이터를 읽을 수 있다.
 */
async function waitForPublishedPerformance(
  client: SanityClient,
  id: string,
  draft: PerformanceDocument,
) {
  const draftArtistRefs = normalizeArtistRefs(draft.artists);

  for (let attempt = 0; attempt < PUBLISH_CHECK_ATTEMPTS; attempt += 1) {
    const document = await client.getDocument<PerformanceDocument>(id);

    if (
      document &&
      document.title === draft.title &&
      document.date === draft.date &&
      document.poster?.asset?._ref === draft.poster?.asset?._ref &&
      JSON.stringify(normalizeArtistRefs(document.artists)) === JSON.stringify(draftArtistRefs)
    ) {
      return document;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, PUBLISH_CHECK_INTERVAL);
    });
  }

  throw new Error('게시된 공연 문서가 최신 상태로 반영되지 않았습니다.');
}

/**
 * 공연 포스터 Gallery Category 조회 / 생성
 */
async function getPosterCategoryId(client: SanityClient) {
  const existingId = await client.fetch<string | null>(
    `*[
      _type == "galleryCategory" &&
      (
        slug.current == $slug ||
        title == $title
      )
    ][0]._id`,
    {
      slug: POSTER_CATEGORY_SLUG,
      title: POSTER_CATEGORY_TITLE,
    },
  );

  if (existingId) {
    return existingId;
  }

  await client.createIfNotExists({
    _id: POSTER_CATEGORY_ID,
    _type: 'galleryCategory',
    title: POSTER_CATEGORY_TITLE,
    slug: {
      _type: 'slug',
      current: POSTER_CATEGORY_SLUG,
    },
    visible: true,
    orderRank: await getNewOrderRank(client, 'galleryCategory'),
  });

  return POSTER_CATEGORY_ID;
}

/**
 * 새로운 document를 목록 최상단에 배치하기 위한 orderRank 생성
 */
async function getNewOrderRank(client: SanityClient, type: string) {
  const firstRank = await client.fetch<string | null>(
    `*[
      _type == $type &&
      defined(orderRank)
    ]
    | order(orderRank asc)
    [0].orderRank`,
    { type },
  );

  return firstRank ? LexoRank.parse(firstRank).genPrev().toString() : LexoRank.middle().toString();
}

/**
 * Performance → Gallery 동기화
 */
async function syncGalleryItem(client: SanityClient, performance: PerformanceDocument) {
  const performanceId = publishedId(performance._id);

  if (!performance.title || !performance.date || !performance.poster?.asset?._ref) {
    throw new Error('공연명, 공연 일시, 공연 포스터를 모두 입력한 후 게시해주세요.');
  }

  const [categoryId, existingId, artistNames] = await Promise.all([
    getPosterCategoryId(client),

    client.fetch<string | null>(
      `*[
          _type == "galleryItem" &&
          performance._ref == $performanceId
        ][0]._id`,
      { performanceId },
    ),

    client.fetch<string[]>(
      `*[
          _id == $performanceId
        ][0].artists[]->name`,
      { performanceId },
    ),
  ]);

  const galleryId = existingId ?? galleryIdFor(performanceId);

  const fields = {
    title: performance.title,

    image: performance.poster,

    description: galleryDescription(performance.date, artistNames ?? []),

    category: {
      _type: 'reference' as const,
      _ref: categoryId,
    },

    performance: {
      _type: 'reference' as const,
      _ref: performanceId,
    },

    performanceDate: performance.date,
  };

  /**
   * 최초 생성
   */
  if (!existingId) {
    await client.createIfNotExists({
      _id: galleryId,
      _type: 'galleryItem',

      display: true,

      orderRank: await getNewOrderRank(client, 'galleryItem'),

      ...fields,
    });
  }

  /**
   * 기존 Gallery 업데이트
   *
   * display / orderRank 등
   * 관리자가 수정하는 필드는 유지한다.
   */
  await client.patch(galleryId).set(fields).commit();
}

/**
 * Performance Publish
 * +
 * Gallery 자동 동기화
 */
export const PublishPerformanceAndSyncGalleryAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion });

  const { publish } = useDocumentOperation(props.id, props.type);

  const [isRunning, setIsRunning] = useState(false);

  return {
    label: isRunning ? '게시 및 동기화 중...' : '게시 및 공연 포스터 동기화',

    disabled: Boolean(publish.disabled) || isRunning,

    onHandle: async () => {
      const draft = props.draft as PerformanceDocument | null;

      if (!draft) {
        window.alert('게시할 공연 데이터를 확인할 수 없습니다.');
        return;
      }

      if (!draft.title) {
        window.alert('공연명을 입력한 후 게시해주세요.');
        return;
      }

      if (!draft.date) {
        window.alert('공연 일시를 입력한 후 게시해주세요.');
        return;
      }

      if (!draft.poster?.asset?._ref) {
        window.alert('공연 포스터를 등록한 후 게시해주세요.');
        return;
      }

      setIsRunning(true);

      try {
        /**
         * Sanity publish 시작
         */
        publish.execute();

        /**
         * 실제 published document가
         * 최신 draft 내용으로 반영될 때까지 대기
         */
        const performance = await waitForPublishedPerformance(client, publishedId(props.id), draft);

        /**
         * Gallery 동기화
         */
        await syncGalleryItem(client, performance);
      } catch (error) {
        console.error('Performance gallery synchronization failed', error);

        window.alert(
          '공연은 게시되었지만 갤러리 동기화에 실패했습니다. 다시 게시해 재시도해주세요.',
        );
      } finally {
        setIsRunning(false);
      }
    },
  };
};

/**
 * Performance 삭제
 * +
 * 연결된 Gallery 삭제
 */
export const DeletePerformanceAndGalleryAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion });

  const { delete: deleteOperation } = useDocumentOperation(props.id, props.type);

  const [isRunning, setIsRunning] = useState(false);

  return {
    label: isRunning ? '삭제 중...' : '공연 및 연결된 공연 포스터 삭제',

    disabled: Boolean(deleteOperation.disabled) || isRunning,

    onHandle: async () => {
      setIsRunning(true);

      try {
        const performanceId = publishedId(props.id);

        /**
         * Performance를 참조하고 있는
         * Gallery documents 조회
         */
        const galleryIds = await client.fetch<string[]>(
          `*[
                _type == "galleryItem" &&
                performance._ref == $performanceId
              ]._id`,
          { performanceId },
        );

        /**
         * Gallery가 Performance를 strong reference
         * 하고 있으므로 먼저 Gallery 삭제
         */
        if (galleryIds.length > 0) {
          let transaction = client.transaction();

          for (const galleryId of galleryIds) {
            transaction = transaction.delete(galleryId);
          }

          await transaction.commit();
        }

        /**
         * Performance 삭제
         */
        deleteOperation.execute();
      } catch (error) {
        console.error('Performance gallery deletion failed', error);

        window.alert('연결된 공연 포스터 삭제에 실패했습니다. 공연은 삭제되지 않았습니다.');
      } finally {
        setIsRunning(false);
      }
    },
  };
};
