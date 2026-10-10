'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Performance } from '@/types/performance';

import { SkeletonImage } from '@/components/ui/Skeleton';
import { urlFor } from '@/sanity/lib/image';

import { formatDate, formatWeekDay, formatTime, formatDDay } from '@/utils/date';
import useHydrated from '@/hooks/useHydrated';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './style.scss';

gsap.registerPlugin(ScrollTrigger);

interface UpcomingProps {
  performances: Performance[];
}

export default function Upcoming({ performances }: UpcomingProps) {
  const isHydrated = useHydrated();
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.upcoming__header', {
        opacity: 0,
        y: 80,
        duration: 1,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.upcoming__header',
          start: 'top 100%',
          once: true,
        },
      });

      const items = gsap.utils.toArray<HTMLElement>('.upcoming__list');

      if (!items.length) return;

      gsap.set(items, {
        opacity: 0,
        y: 50,
      });

      gsap.to(items, {
        opacity: 1,
        y: 0,

        duration: 0.8,
        stagger: 0.15,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 75%',
          once: true,

          markers: false,
        },
      });
    }, rootRef);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, [performances]);

  return (
    <section ref={rootRef} className="upcoming">
      <div className="upcoming__inner">
        <div className="upcoming__header">
          <Link className="title" href="/performances">
            UPCOMING <br className="mo-view" />
            PERFORMANCE
            <span className="material-symbols-rounded icon">arrow_forward_ios</span>
          </Link>
        </div>

        <div className="upcoming__list">
          {performances.length > 0 ? (
            <Swiper
              slidesPerView={1.05}
              grid={{
                fill: 'column',
                rows: 3,
              }}
              spaceBetween={10}
              speed={700}
              /*autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}*/
              pagination={{
                clickable: true,
              }}
              //navigation={true}
              breakpoints={{
                1023: {
                  slidesPerView: 2,
                  grid: {
                    fill: 'column',
                    rows: 4,
                  },
                },
              }}
              modules={[Grid, Pagination, Navigation]}
              className="upcoming__swiper"
            >
              {performances.map((performance) => (
                <SwiperSlide key={performance._id}>
                  <Link
                    href={`/performances/${performance.slug?.current ?? ''}`}
                    className="upcoming__item"
                  >
                    <SkeletonImage
                      className="upcoming__poster"
                      src={
                        performance.poster?.asset ? urlFor(performance.poster).width(100).url() : ''
                      }
                      alt={performance.title}
                      size={100}
                    />

                    <div className="upcoming__date">
                      <strong>{formatDate(performance.date).slice(5)}</strong>

                      <span>{formatWeekDay(performance.date)}</span>

                      <span>{formatTime(performance.date)}</span>
                    </div>

                    <div className="upcoming__info">
                      <div>
                        <em>{isHydrated ? formatDDay(performance.date) : null}</em>
                      </div>

                      <h2>{performance.title}</h2>
                      {performance.artists && performance.artists.length > 0 && (
                        <p>{performance.artists.map((artist) => artist.name).join(' · ')}</p>
                      )}
                    </div>

                    <span className="upcoming__arrow">
                      <span className="material-symbols-rounded">arrow_forward_ios</span>
                    </span>

                    {/*<div className="upcoming__posterBig">
                     <img
                        src={urlFor(performance.poster).url()}
                        alt={performance.title}
                      />
                  </div>*/}
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="upcoming__empty">예정된 공연이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}
