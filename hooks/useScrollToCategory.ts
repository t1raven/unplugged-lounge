'use client';

import { useCallback } from 'react';
import { useLenis } from '@/components/providers/LenisProvider';

export default function useScrollToCategory() {
  const { resize, scrollTo } = useLenis();

  return useCallback(() => {
    const header = document.getElementById('site-header');
    const element = document.querySelector('.category_search_nav');
    const elementPrev = element?.previousElementSibling;
    const elementPrevRect = elementPrev?.getBoundingClientRect();

    if (!header || !elementPrevRect) return;

    console.log(elementPrevRect?.height, window.scrollY);

    if (elementPrevRect?.height > window.scrollY) return;

    //console.log(elementPrevRect?.height, window.scrollY);

    const top = elementPrevRect?.height - header.offsetHeight;

    resize();
    scrollTo(top);
  }, [resize, scrollTo]);
}
