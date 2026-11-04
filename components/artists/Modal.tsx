'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

import './Modal.scss';

export default function ArtistModal({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <Modal className="artist-modal" open onClose={() => router.back()} ariaLabel="아티스트 상세">
      {children}
    </Modal>
  );
}
