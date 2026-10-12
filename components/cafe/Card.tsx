'use client';

import { Image } from '@/components/ui/Skeleton';
import { urlFor } from '@/sanity/lib/image';

import type { Cafe } from '@/types/cafe';

interface Props {
  item: Cafe;
}

export default function MenuCard({ item }: Props) {
  return (
    <article className="menu-card">
      <Image
        className="menu-card__image"
        src={item.imageUrl ? urlFor(item.imageUrl).width(600).url() : ''}
        alt={item.name}
        size={600}
      >
        {item.label && (
          <div className="menu-card__label">
            {item.label.includes('new') && <div className="menu-card__label_item new">NEW</div>}
            {item.label.includes('best') && <div className="menu-card__label_item best">BEST</div>}
          </div>
        )}
      </Image>

      <div className="menu-card__info">
        {item.label && (
          <div className="menu-card__label">
            {item.label.includes('new') && <div className="menu-card__label_item new">NEW</div>}
            {item.label.includes('best') && <div className="menu-card__label_item best">BEST</div>}
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
