'use client';

import Link from 'next/link';

import Modal from '@/components/ui/Modal';

import './style.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}
export default function SnsModal({ open, onClose }: Props) {
  return (
    <Modal className="sns-modal" open={open} onClose={onClose}>
      <ul className="sns-list">
        <li>
          <Link href="https://www.instagram.com/unplugged.lounge/" target="_blank">
            <i className="material-symbols-rounded icon" translate="no">
              music_note_2
            </i>
            언플러그드 라운지
            <i className="material-symbols-rounded outlink" translate="no">
              arrow_outward
            </i>
          </Link>
          <p>언플러그드 라운지의 공연 일정과 공식 소식</p>
        </li>
        <li>
          <Link href="https://www.instagram.com/cafeunplugged.seogyo/" target="_blank">
            <i className="material-symbols-rounded icon" translate="no">
              coffee
            </i>
            서교음악다방
            <i className="material-symbols-rounded outlink" translate="no">
              arrow_outward
            </i>
          </Link>
          <p>따뜻하고 활기찬 2층의 카페 소식</p>
        </li>
        <li>
          <Link href="https://www.instagram.com/unplugged.lounge.zip/" target="_blank">
            <i className="material-symbols-rounded icon" translate="no">
              news
            </i>
            언플러그드 라운지 매거진
            <i className="material-symbols-rounded outlink" translate="no">
              arrow_outward
            </i>
          </Link>
          <p>공연 후기와 다양한 컨텐츠</p>
        </li>
      </ul>
    </Modal>
  );
}
