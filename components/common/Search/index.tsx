'use client';

import { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getDateParts } from '@/utils/date';
import { Loading } from '@/components/ui/Skeleton';
import Link from 'next/link';

import Modal from '@/components/ui/Modal';

import './style.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

type SearchResult = {
  _id: string;
  _type: 'performance' | 'artist';
  title: string;
  date?: string;
  slug?: string;
};

export default function SearchModal({ open, onClose }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = keyword.trim();

    if (!query) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: SearchResult[] = await response.json();

        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setKeyword('');
    setResults([]);
  }

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);

    if (!open) {
      setKeyword('');
      setResults([]);
      setLoading(false);
    }
  }

  return (
    <Modal
      className="search-modal"
      header={
        <SearchInput open={open} closeCart={onClose} keyword={keyword} setKeyword={setKeyword} />
      }
      open={open}
      onClose={onClose}
    >
      <div className="search-results">
        {!keyword.trim() ? (
          <div className="search-results-status">검색어를 입력하세요.</div>
        ) : loading ? (
          <div className="search-results-status">
            <Loading loading={loading} />
            검색 중...
          </div>
        ) : results.length > 0 ? (
          <ul className="search-results-list">
            {results.map((item) => (
              <li key={item._id}>
                <Link
                  key={item._id}
                  href={
                    item._type === 'performance'
                      ? `/performances/${item.slug}`
                      : `/artists/${item.slug}`
                  }
                >
                  <div className="search-results-text">
                    <HighlightText text={item.title} keyword={keyword} />
                    {item._type === 'performance' &&
                      item.date &&
                      (() => {
                        const { year, month, day, weekday, hour, minute } = getDateParts(item.date);
                        return (
                          <span className="search-results-date">{`${year}.${month}.${day} (${weekday.slice(0, 1)}) ${hour}:${minute}`}</span>
                        );
                      })()}
                  </div>

                  <div className="search-results-type">
                    {item._type === 'performance' ? '공연' : '아티스트'}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="search-results-status">검색 결과가 없습니다.</div>
        )}
      </div>
    </Modal>
  );
}

function SearchInput({
  open,
  closeCart,
  keyword,
  setKeyword,
}: {
  open: boolean;
  closeCart: () => void;
  keyword: string;
  setKeyword: (value: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    } else {
      searchRef.current?.blur();
    }
  }, [open]);

  return (
    <div className="search-input">
      <span className="material-symbols-rounded icon">search</span>
      <input
        placeholder="공연, 아티스트 검색"
        type="search"
        ref={searchRef}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      ></input>
      <button type="button" className="modal-header-btn" onClick={closeCart} aria-label="닫기">
        <span className="material-symbols-rounded">close</span>
      </button>
    </div>
  );
}

function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  const query = keyword.trim();

  if (!query) return <>{text}</>;

  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());

  if (index === -1) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  return (
    <>
      {text.split(regex).map((part, index) =>
        part.toLocaleLowerCase() === query.toLocaleLowerCase() ? (
          <mark key={index} className="search-results-highlight">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
