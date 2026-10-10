'use client';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

import type { Cafe } from '@/types/cafe';

interface Props {
  item: Cafe;
}

export default function MenuCard({ item }: Props) {
  return (
    <article className="menu-card">
      <div className="menu-card__image">
        {item.label && (
          <div className="goods-card__label">
            {item.label.includes('new') && <div className="goods-card__label_item new">NEW</div>}
            {item.label.includes('best') && <div className="goods-card__label_item best">BEST</div>}
          </div>
        )}

        {item.imageUrl && (
          <Image
            src={urlFor(item.imageUrl).width(600).url()}
            alt={item.name}
            fill
            priority
            sizes="(max-width: 768px) 50vw, 400px"
          />
        )}
      </div>

      <div className="menu-card__info">
        {item.label && (
          <div className="goods-card__label">
            {item.label.includes('new') && <div className="goods-card__label_item new">NEW</div>}
            {item.label.includes('best') && <div className="goods-card__label_item best">BEST</div>}
          </div>
        )}
        <div className="menu-card__title">
          <h2>{item.name}</h2>
        </div>

        {item.description && <div className="menu-card__desc">{item.description}</div>}

        <div className="menu-card__price">
          <strong>
            {item.price.toLocaleString()}
            <small>원</small>
          </strong>
        </div>
      </div>
    </article>
  );
}
