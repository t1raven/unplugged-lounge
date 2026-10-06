'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useDevice } from '@/components/providers/DeviceProvider';
import { useCart } from '@/components/providers/CartProvider';
import Link from 'next/link';
import gsap from 'gsap';
import useLiquidEase from '@/hooks/useLiquidEase';

import './style.scss';

export default function Gnb() {
  useLiquidEase();

  const pathname = usePathname();

  const gnbRef = useRef<HTMLElement>(null);
  const moveBgRef = useRef<HTMLDivElement>(null);
  const isCollapsedRef = useRef(false);
  const menuTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const { isDesktop, isReady } = useDevice();
  const { cartCount } = useCart();

  const moveBackground = useCallback((animate = true) => {
    if (!gnbRef.current || !moveBgRef.current) return;

    const activeMenu = gnbRef.current.querySelector('li.active') as HTMLElement | null;

    if (!activeMenu) return;

    const navRect = gnbRef.current.getBoundingClientRect();
    const menuRect = activeMenu.getBoundingClientRect();
    const scale = navRect.width / gnbRef.current.offsetWidth || 1;

    const x = (menuRect.left - navRect.left) / scale;
    const width = menuRect.width / scale;

    if (!animate) {
      gsap.set(moveBgRef.current, {
        x,
        y: '-50%',
        width,
      });
    }

    if (!document.querySelector('#site-fnb')) {
      gsap.set(gnbRef.current, {
        clearProps: 'scale',
      });
    }

    gsap.to(moveBgRef.current, {
      x,
      y: '-50%',
      scale: 1,
      width,
      duration: 0.45,
      ease: 'liquidEase',
      overwrite: 'auto',
    });
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      moveBackground(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [moveBackground, pathname]);

  const collapseGNB = useCallback((animate = true) => {
    if (!gnbRef.current || !moveBgRef.current || isCollapsedRef.current) return;
    isCollapsedRef.current = true;
    menuTimelineRef.current?.kill();
    gnbRef.current.parentElement?.classList.add('collapse');

    const menuLi = gnbRef.current.querySelectorAll<HTMLLIElement>('li > a');
    const menuBtn = gnbRef.current.querySelector<HTMLLIElement>('.menu-btn');
    const Fnb = document.querySelector<HTMLLIElement>('#site-fnb');

    const width = gnbRef.current.offsetHeight || 60;

    if (!animate) {
      gsap.set(menuLi, {
        scale: 0,
        opacity: 0,
        visibility: 'hidden',
      });
      gsap.set(moveBgRef.current, {
        opacity: 0,
        visibility: 'hidden',
      });
      gsap.set(menuBtn, {
        opacity: 1,
        visibility: 'visible',
      });
      gsap.set(gnbRef.current, {
        width,
        scale: 1,
        borderWidth: 1,
      });
      gsap.set(Fnb, {
        opacity: 1,
        visibility: 'visible',
      });
      return;
    }

    gsap.to(gnbRef.current, {
      scale: 1,
      duration: 0.15,
      ease: 'liquidEase',
      overwrite: 'auto',
    });

    const tl = gsap.timeline();
    menuTimelineRef.current = tl;

    gsap.set(Fnb, {
      animation: 'none',
    });

    tl.to(
      menuLi,
      {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        visibility: 'hidden',
        ease: 'liquidEase',
      },
      '+=0.5',
    );
    tl.to(
      moveBgRef.current,
      {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.25,
        ease: 'liquidEase',
      },
      '-=0.5',
    );
    tl.to(
      gnbRef.current,
      {
        width: width,
        borderWidth: 1,
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.25',
    );
    tl.to(
      menuBtn,
      {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.5',
    );
    tl.fromTo(
      Fnb,
      {
        opacity: 0,
        visibility: 'hidden',
      },
      {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.25',
    );
  }, []);

  const expandGNB = useCallback(() => {
    if (!gnbRef.current || !moveBgRef.current || !isCollapsedRef.current) return;
    isCollapsedRef.current = false;
    menuTimelineRef.current?.kill();
    gnbRef.current.parentElement?.classList.remove('collapse');

    const menuLi = gnbRef.current.querySelectorAll<HTMLLIElement>('li > a');
    const menuBtn = gnbRef.current.querySelector<HTMLLIElement>('.menu-btn');
    const Fnb = document.querySelector<HTMLLIElement>('#site-fnb');
    const menuFnbopacity = isReady && isDesktop ? 1 : 0;

    const tl = gsap.timeline();
    menuTimelineRef.current = tl;

    tl.to(menuBtn, {
      opacity: 0,
      visibility: 'hidden',
      duration: 0.5,
      ease: 'liquidEase',
    });
    tl.to(
      gnbRef.current,
      {
        width: `100%`,
        borderWidth: '',
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.5',
    );
    tl.to(
      Fnb,
      {
        opacity: menuFnbopacity,
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.5',
    );
    menuLi.forEach((item) => {
      tl.to(
        item,
        {
          scale: 1,
          opacity: 1,
          visibility: 'visible',
          duration: 0.5,
          ease: 'liquidEase',
        },
        '-=0.45',
      );
    });
    tl.to(
      moveBgRef.current,
      {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'liquidEase',
      },
      '-=0.25',
    );
  }, [isReady, isDesktop]);

  const syncMenu = useCallback(
    (animate = true) => {
      if (!isReady) return false;
      if (!isDesktop && document.querySelector('#site-fnb')) {
        collapseGNB(animate);
      } else {
        expandGNB();
      }
    },
    [collapseGNB, expandGNB, isReady, isDesktop],
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      syncMenu();
    });

    return () => cancelAnimationFrame(frameId);
  }, [syncMenu, pathname]);

  useEffect(() => {
    const background = moveBgRef.current;
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const width = window.innerWidth;
      // Safari 주소창 변화처럼 높이만 바뀌는 resize는 무시한다.
      if (width === lastWidth) return;
      lastWidth = width;

      const frameId = requestAnimationFrame(() => {
        moveBackground(false);
        syncMenu(false);
      });
      const timeoutId = setTimeout(() => moveBackground(false), 500);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timeoutId);
      };
    };

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;

      if (Math.abs(scrollDiff) >= 50) {
        if (scrollDiff > 0) {
          syncMenu();
        }
        lastScrollY = currentScrollY;
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (gnbRef.current && !gnbRef.current.contains(event.target as Node)) {
        syncMenu();
      }
    };

    moveBackground(false);
    syncMenu(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleOutsideClick);
      menuTimelineRef.current?.kill();
      gsap.killTweensOf(background);
    };
  }, [moveBackground, syncMenu]);

  return (
    <div id="site-gnb">
      <nav ref={gnbRef} aria-label="주 메뉴">
        <button
          type="button"
          className="menu-btn"
          aria-label="메뉴 펼치기"
          onClick={() => expandGNB()}
        >
          <span className="icon material-symbols-rounded" translate="no" aria-hidden="true">
            grid_view
          </span>
        </button>
        <ul>
          <li className={pathname === '/' ? 'active' : ''}>
            <Link href="/" title="홈">
              <span className="icon material-symbols-rounded" translate="no">
                home
              </span>
              <span className="text">홈</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/cafe') ? 'active' : ''}>
            <Link href="/cafe" title="카페">
              <span className="icon material-symbols-rounded" translate="no">
                local_cafe
              </span>
              <span className="text">카페</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/performances') ? 'active' : ''}>
            <Link href="/performances" title="공연예매">
              <span className="icon material-symbols-rounded" translate="no">
                confirmation_number
              </span>
              <span className="text">공연예매</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/rental') ? 'active' : ''}>
            <Link href="/rental" title="공연·대관신청">
              <span className="icon material-symbols-rounded" translate="no">
                developer_guide
              </span>
              <span className="text">공연·대관신청</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/goods') ? 'active' : ''}>
            <Link href="/goods" title="굿즈·앨범">
              <span className="goods_icon">
                <span className="icon material-symbols-rounded" translate="no">
                  local_mall
                </span>
                {cartCount > 0 && <span className="cnt">{cartCount}</span>}
              </span>
              <span className="text">굿즈·앨범</span>
            </Link>
          </li>
          <li className={pathname.startsWith('/archives') ? 'active' : ''}>
            <Link href="/archives" title="아카이브">
              <span className="icon material-symbols-rounded" translate="no">
                inventory_2
              </span>
              <span className="text">아카이브</span>
            </Link>
          </li>
        </ul>
        <div className="move-bg" ref={moveBgRef}></div>
      </nav>
    </div>
  );
}
