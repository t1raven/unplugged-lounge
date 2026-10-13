'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import CategoryNav from '@/components/common/CategoryNav';
import useScrollToCategory from '@/hooks/useScrollToCategory';

import MenuCard from './Card';

import type { Category } from '@/types/category';
import type { Cafe } from '@/types/cafe';

import { Loading } from '@/components/ui/Skeleton';

import './style.scss';

interface Props {
  categories: Category[];
  items: Cafe[];
}

export default function MenuList({ categories, items: initialItems }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLElement>(null);

  const animationContextRef = useRef<gsap.Context | null>(null);
  const previousLengthRef = useRef(0);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug ?? '');

  const [items, setItems] = useState<Cafe[]>(initialItems);

  const [loading, setLoading] = useState(false);

  const scrollToCategory = useScrollToCategory();

  /*
   * 카테고리 변경
   */
  const handleCategoryChange = useCallback(
    async (category: string) => {
      if (category === activeCategory) return;

      scrollToCategory();
      setActiveCategory(category);
      setLoading(true);

      try {
        const params = new URLSearchParams({
          category,
        });

        const response = await fetch(`/api/cafe?${params.toString()}`);

        if (!response.ok) {
          throw new Error('데이터를 불러오지 못했습니다.');
        }

        const data = await response.json();

        animationContextRef.current?.revert();
        animationContextRef.current = null;
        previousLengthRef.current = 0;

        setItems(data.items);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, scrollToCategory],
  );

  /*
   *  등장 애니메이션
   */
  useLayoutEffect(() => {
    const grid = gridRef.current;

    if (!grid || items.length === 0) return;

    const previousLength = previousLengthRef.current;

    const allItems = grid.querySelectorAll('.menu-card');

    const newItems = Array.from(allItems).slice(previousLength);

    if (!newItems.length) return;

    animationContextRef.current?.revert();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        newItems,
        {
          opacity: 0,
          y: 30,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'all',
        },
      );
    }, grid);

    animationContextRef.current = ctx;

    previousLengthRef.current = items.length;
  }, [items]);

  return (
    <>
      <CategoryNav
        category={categories}
        categoryNavRef={categoryRef}
        activeCategory={activeCategory}
        handleCategory={handleCategoryChange}
      />

      <section className="sub-page-section menu-list">
        <div className="inner">
          {loading ? (
            <Loading loading={loading} />
          ) : items.length ? (
            <div className="menu-grid" ref={gridRef}>
              {items.map((item) => (
                <MenuCard item={item} key={item._id} />
              ))}
            </div>
          ) : (
            <div className="menu-empty">등록된 메뉴가 없습니다.</div>
          )}
        </div>
      </section>
    </>
  );
}
