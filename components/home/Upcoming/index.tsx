'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Performance } from '@/types/performance';

import PerformanceCard from '@/components/performances/Card';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
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
  const rootRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useLayoutEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    let frame = 0;
    const updateHeight = () => {
      if (swiper.destroyed) return;

      const slideHeight = Math.max(
        0,
        ...swiper.slides.map((slide) => slide.getBoundingClientRect().height),
      );
      if (!slideHeight) return;

      const rows = swiper.params.grid?.rows ?? 1;
      const spacing = swiper.params.spaceBetween ?? 0;
      const gap =
        typeof spacing === 'number'
          ? spacing
          : spacing.includes('%')
            ? (parseFloat(spacing) / 100) * swiper.size
            : parseFloat(spacing);
      const height = `${slideHeight * rows + gap * (rows - 1)}px`;

      if (swiper.wrapperEl.style.height !== height) {
        swiper.wrapperEl.style.height = height;
        ScrollTrigger.refresh();
      }
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHeight);
    };
    const handleResize = () => {
      if (swiper.destroyed) return;

      swiper.update();
      scheduleUpdate();
    };
    const observer = new ResizeObserver(scheduleUpdate);
    swiper.slides.forEach((slide) => observer.observe(slide));
    window.addEventListener('resize', handleResize);
    swiper.on('resize', scheduleUpdate);
    swiper.on('breakpoint', scheduleUpdate);
    swiper.on('update', scheduleUpdate);
    updateHeight();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      swiper.off('resize', scheduleUpdate);
      swiper.off('breakpoint', scheduleUpdate);
      swiper.off('update', scheduleUpdate);
    };
  }, [performances]);

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
              onSwiper={(instance) => {
                swiperRef.current = instance;
              }}
              slidesPerView={1.05}
              grid={{
                fill: 'column',
                rows: 4,
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
                1024: {
                  slidesPerView: 2,
                },
              }}
              modules={[Grid, Pagination, Navigation]}
              className="upcoming__swiper"
            >
              {performances.map((performance) => (
                <SwiperSlide key={performance._id}>
                  <PerformanceCard type="upcoming" performance={performance} />
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
