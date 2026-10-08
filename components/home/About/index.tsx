'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

import './style.scss';

gsap.registerPlugin(ScrollTrigger);

export type TextAlign = 'left' | 'center' | 'right';

interface Props {
  data: {
    title?: string;
    images?: {
      image: string;
      alt?: string;
      position?: string;
    }[];
    description?: {
      text?: string;
      align?: TextAlign;
    };
    faq?: {
      title?: string;
      content?: string;
    }[];
    caution?: {
      title?: string;
      texts?: string[];
    };
  };
}

export default function About({ data }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  const [active, setActive] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActive((current) => (current === index ? null : index));
  };

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      /*
       * ABOUT 타이틀
       */
      gsap.from('.about__heading', {
        opacity: 0,
        y: 80,
        duration: 1,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.about__heading',
          start: 'top 80%',
          once: true,
        },
      });

      /*
       * 이미지 등장
       */
      gsap.from('.about__image', {
        opacity: 0,
        y: 80,
        duration: 1,

        stagger: 0.15,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.about__gallery',
          start: 'top 75%',
          once: true,
        },
      });

      /*
       * 이미지 Parallax
       */
      const speedDate = [-8, 12, -15, 8];

      gsap.utils.toArray<HTMLElement>('.about__image').forEach((image, index) => {
        const speed = speedDate[index] || 10;

        gsap.to(image, {
          yPercent: speed,

          ease: 'none',

          scrollTrigger: {
            trigger: image,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      /*
       * 설명 텍스트
       */
      gsap.from('.about__text', {
        opacity: 0,
        y: 60,
        duration: 1,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.about__text',
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('.about__faq', {
        opacity: 0,
        y: 60,
        duration: 1,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.about__faq',
          start: 'top 80%',
          once: true,
        },
      });

      /*
       * Equipment
       */
      /*gsap.from('.about__equipment', {
        opacity: 0,
        y: 60,
        duration: 1,

        ease: 'power3.out',

        scrollTrigger: {
          trigger: '.about__equipment',
          start: 'top 80%',
          once: true,
        },
      });*/
    }, rootRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="about">
      <div className="about__inner">
        {/* 제목 */}
        <div className="about__heading">
          <p>ABOUT</p>

          <h2>{data.title}</h2>
        </div>

        {/* 이미지 갤러리 */}
        <div className="about__gallery">
          {(data.images ?? []).map((item, index) => (
            <div key={index} className={`about__image about__image--${index + 1}`}>
              <Image
                src={urlFor(item.image).width(800).url()}
                alt={item.alt || ''}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          ))}
        </div>

        {/* 소개 */}
        {data.description?.text && (
          <div className="about__text">
            <p style={{ textAlign: data.description.align || 'right' }}>{data.description.text}</p>
          </div>
        )}

        {(data.faq?.length ?? 0) > 0 && (
          <div className="about__faq">
            {(data.faq ?? []).map((item, index) => {
              const isActive = active === index;

              return (
                <div key={index} className={`faq-item ${isActive ? 'is-active' : ''}`}>
                  <button
                    type="button"
                    className="faq-item__header"
                    onClick={() => toggle(index)}
                    aria-expanded={isActive}
                  >
                    <span className="faq-item__number">0{index + 1}</span>

                    <strong>{item.title}</strong>

                    <span className="faq-item__icon">+</span>
                  </button>

                  <div
                    className="faq-item__content"
                    style={{
                      gridTemplateRows: isActive ? '1fr' : '0fr',
                    }}
                  >
                    <div>
                      <p>{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {false /*data.caution?.title*/ && (
          <div className="about__notice">
            <h4>{data.caution?.title || 'ETIQUETTE'}</h4>

            <ul>
              {data.caution?.texts?.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
