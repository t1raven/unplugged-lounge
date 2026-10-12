'use client';

import { RefObject, useState, useRef, useEffect } from 'react';
import type { Category } from '@/types/category';
import useFadeUpEffect from '@/hooks/useFadeUpEffect';

import './style.scss';

interface Props {
  category: Category[];
  categoryNavRef?: RefObject<HTMLElement | null>;
  activeCategory: string;
  handleCategory: (slug: string) => void;

  searchActive?: boolean;
  searchRef?: RefObject<HTMLInputElement | null>;
  searchInput?: string;
  setSearchInput?: (value: string) => void;
  toggleSearch?: () => void;
  searchHandle?: () => void;
  searchPlaceholder?: string;
}

export default function CategoryNav({
  category,
  activeCategory,
  handleCategory,
  categoryNavRef,

  searchInput,
  setSearchInput,
  searchHandle,
  searchPlaceholder,
}: Props) {
  useFadeUpEffect('.category_search_nav');

  const [searchActive, setSearchActive] = useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const toggleSearch = async () => {
    setSearchActive((prev) => {
      const state = !prev;

      // 활성화되는 시점(true)에 내부 input에 포커스
      if (state) {
        searchRef.current?.focus();
      } else {
        searchRef.current?.blur();
      }

      return state;
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchActive(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchActive(false);
      }
    };

    const handlefocusout = (event: FocusEvent) => {
      if (!event.target || !(event.target instanceof HTMLElement)) return;
      if (event.target.tagName === 'INPUT') {
        setSearchActive(false);
      }
    };

    if (searchActive) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('focusout', handlefocusout);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusout', handlefocusout);
    };
  }, [searchActive]);

  return (
    <div className={`category_search_nav ${searchActive ? 'active' : ''}`}>
      <div className="category_search_nav__inner">
        {setSearchInput && (
          <div className="search-nav">
            <div className="input">
              <span className="material-symbols-rounded icon">search</span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchHandle) {
                    searchHandle();
                  }
                }}
                placeholder={searchPlaceholder}
                ref={searchRef}
              />
            </div>

            <button type="button" onClick={toggleSearch}>
              <span className="material-symbols-rounded">search</span>
            </button>
          </div>
        )}
        <nav className={`category-nav`} ref={categoryNavRef}>
          {category.map((category) => (
            <button
              key={category._id}
              type="button"
              className={activeCategory === category.slug ? 'active' : ''}
              onClick={() => handleCategory(category.slug)}
            >
              {category.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
