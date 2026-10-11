'use client';

import './style.scss';

export default function Loading({
  loading,
  children,
}: {
  loading: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      {loading && (
        <div className="loading-skeleton">
          <svg viewBox="22 22 44 44">
            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6"></circle>
          </svg>
        </div>
      )}
      {children}
    </>
  );
}
