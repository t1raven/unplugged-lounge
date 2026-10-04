'use client';

import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/sanity/lib/image';
import { PortableText } from '@portabletext/react';

import { useDevice } from '@/components/providers/DeviceProvider';
import { formatDateTime } from "@/utils/formatDateTime";

import type { Performance } from '@/types/performance';

import Fnb from '@/components/layout/Fnb'
import { Button } from '@/components/ui/Button'

import './View.scss';


const admissionTypeNames: Record<string, string> = {
  1: '입장번호순',
  2: '공연장대기순',
}

const viewingTypeNames: Record<string, string> = {
  1: '좌석',
  2: '입석',
}

const extractInstagramIdWithRegex = (urlStr: string): string | null => {
  const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/;
  const match = urlStr.match(regex);

  return match ? match[1] : null;
}

const handleShare = async () => {
  const url = window.location.href;

  // 네이티브 공유 지원
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url,
      });
    } catch (error) {
      // 사용자가 공유창을 닫은 경우
      if ((error as DOMException).name !== 'AbortError') {
        console.error('공유 실패:', error);
      }
    }

    return;
  }

  // fallback: URL 복사
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL이 복사되었습니다.');
      return;
    } catch (error) {
      console.error('URL 복사 실패:', error);
    }
  }

  window.prompt('URL을 복사하세요.', url);
};

interface Props {
  performance: Performance;
}

export default function PerformanceViewPage({
  performance,
}: Props) {

  const now = new Date();

  const performanceDate = new Date(performance.date);
  const endDate = new Date(performanceDate.getTime() + 2 * 60 * 60 * 1000);
  const isEnd = now >= endDate;

  const salesOpenDate = new Date(performance.salesOpen ?? new Date());
  const isSalesOpen = now <= salesOpenDate;

  const salesCloseDate = new Date(performance.salesClose ?? new Date());
  const isSalesClose = now >= salesCloseDate;

  const mapUrl = performance.place?.naverMap;

  const { isIOS, isReady } = useDevice();
  const ios = isIOS && isReady ? true : false;

  return (
    <main id="site-body" className="performance-detail">

      {/* ==================================================
          Hero
      ================================================== */}

      <section className="performance-detail-hero">

        <div className="performance-detail-inner">

          <div className="performance-poster">

            {performance.poster?.asset && (
              <Image
                src={urlFor(performance.poster)
                  .width(600)
                  .url()}
                alt={performance.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )}

          </div>

          <div className="performance-detail-content">

            <p className="performance-eyebrow">
              LIVE PERFORMANCE
            </p>

            <h1>
              {performance.title}
            </h1>

            <div className="performance-meta">

              <div className="meta-item">
                <span>공연 일시</span>

                <strong>
                  {formatDateTime(performance.date)}
                </strong>
              </div>

              <div className="meta-item">
                <span>공연 장소</span>

                <strong>
                  {mapUrl ? (
                    <Link href={mapUrl} target="_blank">
                      {performance.place?.name}
                      <i className="material-symbols-rounded icon" translate="no"> arrow_outward</i>
                    </Link>
                  ) : (
                    performance.place?.name
                  )}
                  <p>{performance.place?.address}</p>
                </strong>
              </div>

              {performance.price1 && (
                <div className="meta-item" style={{ gridColumn: !performance.price2 ? '1/3' : 'auto' }}>
                  <span>사전 예매</span>
                  <strong>
                    {performance.price1?.toLocaleString()}원
                    {performance.price1Option && (
                      <small className="opt">
                        ({performance.price1Option})
                      </small>
                    )}
                  </strong>
                </div>
              )}

              {performance.price2 && (
                <div className="meta-item" style={{ gridColumn: !performance.price1 ? '1/3' : 'auto' }}>
                  <span>현장 예매</span>
                  <strong>
                    {performance.price2?.toLocaleString()}원
                    {performance.price2Option && (
                      <small className="opt">
                        ({performance.price2Option})
                      </small>
                    )}
                  </strong>
                </div>
              )}

              <div className="meta-item">
                <span>입장 방식</span>

                <strong>{performance.admissionType ? admissionTypeNames[performance.admissionType] ?? performance.admissionType : '-'}</strong>
              </div>

              <div className="meta-item">
                <span>관람 방식</span>

                <strong>{performance.viewingType ? viewingTypeNames[performance.viewingType] ?? performance.viewingType : '-'}</strong>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ==================================================
          Artists
      ================================================== */}

      {performance.artists &&
        performance.artists.length > 0 && (

          <section className="performance-artists">

            <div className="performance-detail-inner">

              <div className="section-heading">
                <p>ARTIST LINEUP</p>
                <h2>아티스트 라인업</h2>
              </div>

              <div className="artist-list">

                {performance.artists.map(
                  (artist) => (
                    <article
                      key={artist._id}
                      className="artist-card"
                    >
                      <div className="artist-image">
                        <i className="artist-icon material-symbols-rounded" translate="no">artist</i>
                      </div>

                      <div className="artist-info">

                        <h3>
                          {artist.name}
                        </h3>

                        {artist.instagram && (
                          <Link href={artist.instagram!} target="_blank">
                            @{extractInstagramIdWithRegex(artist.instagram)}
                            <i className="material-symbols-rounded icon" translate="no">arrow_outward</i>
                          </Link>
                        )}

                      </div>

                    </article>
                  )
                )}

              </div>

            </div>

          </section>
        )}

      {/* ==================================================
          Description
      ================================================== */}

      <section className="performance-description">

        <div className="performance-detail-inner">

          <div className="section-heading">
            <p>ABOUT PERFORMANCE</p>
            <h2>공연 소개</h2>
          </div>

          <div className="description-content">
            {performance.description ? (
              <PortableText
                value={performance.description}
              />
            ) : (
              <p>
                등록된 공연 소개가 없습니다.
              </p>
            )}
          </div>

        </div>

      </section>

      {/* ==================================================
          Notice
      ================================================== */}
      {performance.notice && (
        <section className="performance-description">

          <div className="performance-detail-inner">

            <div className="section-heading">
              <p>NOTICE</p>
              <h2>공지 사항</h2>
            </div>

            <div className="description-content">
              <PortableText
                value={performance.notice}
              />
            </div>

          </div>

        </section>
      )}

      <Fnb className="site-fnb">
        {isEnd ? (
          <Button opacity={0.7} shadow disabled className="reservation_btn">
            <span>공연 종료</span>
          </Button>
        ) : performance.siteSalesOnly ? (
          <Button opacity={0.7} shadow disabled className="reservation_btn">
            <span>현장예매만 가능합니다.</span>
          </Button>
        ) : !performance.reservationOpen ? (
          <Button opacity={0.7} shadow disabled className="reservation_btn">
            <span>매진되었습니다.</span>
          </Button>
        ) : isSalesOpen ? (
          <Button opacity={0.7} shadow disabled className="reservation_btn">
            <span>
              사전 예매 오픈전
              {performance.salesOpen && <><br /><small>(오픈: {formatDateTime(performance.salesOpen)})</small></>}
            </span>
          </Button>
        ) : isSalesClose ? (
          <Button opacity={0.7} shadow disabled className="reservation_btn">
            <span>
              사전 예매 마감 
              <br/><small>(현장 예매만 가능합니다)</small>
            </span>
          </Button>
        ) : (
          <Button
            href={performance.reservationUrl ?? ""}
            target="_blank"
            className="reservation_btn"
            opacity={0.7}
            shadow
          >
            <span className="icon material-symbols-rounded" translate="no">confirmation_number</span>
            <span>예매하기</span>
          </Button>
        )}
        <Button type="button" className="share_btn" color="secondary" opacity={0.7} shadow onClick={handleShare}>
          <span className="material-symbols-rounded icon" aria-label="공유하기">{ios ? "ios_share" : "share"}</span>
        </Button>
      </Fnb>
    </main>
  );
}