import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import galleryData from '../../content/gallery.json';
import Lightbox from '../Lightbox/Lightbox';

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);

  const images = galleryData.images;
  const total = images.length;
  const AUTOPLAY_DELAY = 4000;

  const goTo = useCallback((index: number) => {
    let i = index;
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    setCurrentIndex(i);
  }, [total]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused || isDragging || lightboxOpen) return;
    const timer = setInterval(next, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, lightboxOpen, next]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Touch/drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    dragCurrentX.current = clientX;
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const diff = dragStartX.current - dragCurrentX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    setIsDragging(false);
  };

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Галерея эмоций
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Реальные моменты счастья из наших съёмок
        </motion.p>

        {/* Slider */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main slide */}
          <div
            className="relative aspect-[3/2] md:aspect-[16/10] max-h-[60vh] rounded-2xl overflow-hidden bg-cream-2 border border-gold-primary/10 shadow-card cursor-grab active:cursor-grabbing"
            ref={trackRef}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: i === currentIndex ? 1 : 0 }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="text-cream/90 text-xs md:text-sm font-body leading-relaxed max-w-2xl line-clamp-2">
                    {img.alt}
                  </p>
                </div>
              </div>
            ))}

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-cream/80 backdrop-blur-sm text-gold-primary flex items-center justify-center hover:bg-cream transition-colors shadow-lg border border-gold-primary/20 z-10"
              aria-label="Предыдущее фото"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-cream/80 backdrop-blur-sm text-gold-primary flex items-center justify-center hover:bg-cream transition-colors shadow-lg border border-gold-primary/20 z-10"
              aria-label="Следующее фото"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Photo counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-cream text-xs font-display px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {total}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                  i === currentIndex
                    ? 'border-gold-primary shadow-md scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`Перейти к фото ${i + 1}`}
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-gold-primary w-6'
                    : 'bg-gold-primary/30 hover:bg-gold-primary/50'
                }`}
                aria-label={`Перейти к фото ${i + 1}`}
              />
            ))}
          </div>

          {/* Open lightbox hint */}
          <button
            onClick={() => openLightbox(currentIndex)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-cream/80 backdrop-blur-sm text-gold-primary flex items-center justify-center hover:bg-cream transition-colors shadow-lg border border-gold-primary/20"
            aria-label="Открыть в полном размере"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      </div>

      <Lightbox
        images={images.map((img) => ({ src: img.src, alt: img.alt }))}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={closeLightbox}
      />
    </section>
  );
}
