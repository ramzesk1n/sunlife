import { useCallback, useEffect, useRef, useState } from 'react';

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  open: boolean;
  index: number;
  onClose: () => void;
}

export default function Lightbox({ images, open, index, onClose }: LightboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(index);

  useEffect(() => {
    if (open) {
      setCur(index);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, index]);

  const go = useCallback(
    (i: number) => {
      const len = images.length;
      if (len === 0) return;
      setCur((i % len + len) % len);
    },
    [images.length]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, cur, go, onClose]);

  if (!open || images.length === 0) return null;

  const current = images[cur];

  return (
    <div
      ref={rootRef}
      data-lb-root=""
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографий"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(29, 29, 31, 0.92)',
        backdropFilter: 'blur(1.5rem)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.35s ease',
      }}
      onClick={(e) => {
        if (e.target === rootRef.current) onClose();
      }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-gold-light border border-gold-light/30 bg-[rgba(29,29,31,0.7)] backdrop-blur-xl hover:bg-gold-light/15 hover:border-gold-light/50 transition-all duration-300 text-lg"
      >
        ✕
      </button>

      {/* Prev */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(cur - 1);
        }}
        aria-label="Предыдущее фото"
        className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-gold-light border border-gold-light/30 bg-[rgba(29,29,31,0.7)] backdrop-blur-xl hover:bg-gold-light/15 hover:border-gold-light/50 transition-all duration-300 text-lg"
      >
        ❮
      </button>

      {/* Image */}
      <img
        src={current.src}
        alt={current.alt}
        className="lb-photo"
        style={{
          maxWidth: '88vw',
          maxHeight: '82vh',
          borderRadius: '1rem',
          boxShadow: '0 1rem 3rem rgba(0,0,0,0.5), 0 0 0 1px rgba(219,169,115,0.15)',
          objectFit: 'contain',
        }}
      />

      {/* Next */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(cur + 1);
        }}
        aria-label="Следующее фото"
        className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-gold-light border border-gold-light/30 bg-[rgba(29,29,31,0.7)] backdrop-blur-xl hover:bg-gold-light/15 hover:border-gold-light/50 transition-all duration-300 text-lg"
      >
        ❯
      </button>

      {/* Counter */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gold-light text-sm bg-[rgba(29,29,31,0.7)] backdrop-blur-lg px-5 py-1.5 rounded-full border border-gold-light/20 tracking-wider"
      >
        {cur + 1} / {images.length}
      </div>
    </div>
  );
}
