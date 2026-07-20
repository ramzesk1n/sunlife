import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Lightbox from '../Lightbox/Lightbox';

interface NewbornPhoto {
  src: string;
  alt: string;
}

const NEWBORN_PHOTOS: NewbornPhoto[] = [
  { src: '/images/newborn_evgeniy.webp', alt: 'Фотосессия Ньюборн в палате роддома — Евгений' },
  { src: '/images/newborn_romashka.webp', alt: 'Фотосессия Ньюборн в палате роддома — Ромашка' },
  { src: '/images/newborn_makar.webp', alt: 'Фотосессия Ньюборн в палате роддома — Макар' },
  { src: '/images/newborn_sashenka.webp', alt: 'Фотосессия Ньюборн в палате роддома — Сашенька' },
  { src: '/images/newborn_varvara.webp', alt: 'Фотосессия Ньюборн в палате роддома — Варвара' },
];

interface NewbornPhotosProps {
  title?: string;
  subtitle?: string;
}

export default function NewbornPhotos({ title, subtitle }: NewbornPhotosProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  return (
    <motion.div
      ref={sectionRef}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {title && (
        <h3 className="font-display text-2xl md:text-3xl font-light text-gold-primary-80 text-center uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto mb-8 md:mb-10">
          {subtitle}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {NEWBORN_PHOTOS.map((photo, idx) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => openLightbox(idx)}
            className="relative aspect-[3/2] rounded-2xl overflow-hidden group cursor-pointer bg-cream-2 border border-gold-primary/10 shadow-card hover:shadow-glass transition-all duration-300"
            aria-label={photo.alt}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              width="1152"
              height="768"
            />
            <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-colors duration-300 flex items-center justify-center">
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        images={NEWBORN_PHOTOS}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={closeLightbox}
      />
    </motion.div>
  );
}
