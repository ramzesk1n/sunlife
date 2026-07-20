import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const beforeImages = [
  '/images/remont_do_1.webp',
  '/images/remont_do_2.webp',
  '/images/remont_do_3.webp',
];

const afterImages = [
  '/images/remont_posle_1.webp',
  '/images/remont_posle_2.webp',
  '/images/remont_posle_3.webp',
];

function PhotoGrid({ images, label }: { images: string[]; label: string }) {
  return (
    <div className="absolute inset-0 p-1.5 sm:p-2 md:p-3 flex flex-col gap-1.5 sm:gap-2 md:gap-3">
      {/* Top photo */}
      <div className="relative flex-1 rounded-lg sm:rounded-xl overflow-hidden">
        <img
          src={images[0]}
          alt={`${label} — фото 1`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      {/* Bottom row — 2 photos */}
      <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-1">
        <div className="relative flex-1 rounded-lg sm:rounded-xl overflow-hidden">
          <img
            src={images[1]}
            alt={`${label} — фото 2`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="relative flex-1 rounded-lg sm:rounded-xl overflow-hidden">
          <img
            src={images[2]}
            alt={`${label} — фото 3`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function PartnershipBeforeAfter() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    },
    [isDragging, updatePosition]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const afterOpacity = position > 95 ? 0 : 1;

  return (
    <section
      ref={sectionRef}
      id="partnership-before-after"
      className="h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      <div className="w-full max-w-5xl flex flex-col items-center">
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-light text-gold-primary-80 text-center mb-2 uppercase tracking-wider shrink-0"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Ремонт помещений
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-sm sm:text-base max-w-xl mx-auto mb-3 sm:mb-4 md:mb-6 shrink-0"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Потяните ползунок, чтобы увидеть результат
        </motion.p>

        <motion.div
          ref={containerRef}
          className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-glass bg-cream-3 shrink-0"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          onMouseDown={(e) => {
            setIsDragging(true);
            updatePosition(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            if (e.touches[0]) updatePosition(e.touches[0].clientX);
          }}
        >
          {/* After layer */}
          <div 
            className="absolute inset-0 transition-opacity duration-200"
            style={{ opacity: afterOpacity }}
          >
            <PhotoGrid images={afterImages} label="После" />
            <div 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gold-dark text-cream text-[10px] sm:text-xs font-display uppercase tracking-wider rounded-full z-10 transition-opacity duration-200"
              style={{ opacity: position > 90 ? 0 : 1 }}
            >
              После
            </div>
          </div>

          {/* Before layer */}
          <div
            className="absolute inset-0 overflow-hidden bg-cream-3"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <PhotoGrid images={beforeImages} label="До" />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-text-dark/70 text-cream text-[10px] sm:text-xs font-display uppercase tracking-wider rounded-full z-10">
              До
            </div>
          </div>

          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cream cursor-ew-resize z-20"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream border-2 border-gold-primary shadow-gold flex items-center justify-center text-gold-primary hover:bg-gold-pale transition-colors"
              aria-label="Ползунок до/после"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 -ml-1.5 sm:-ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </motion.div>

        <motion.p
          className="text-text-muted text-center text-sm sm:text-base mt-3 sm:mt-4 md:mt-6 shrink-0"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          Пример: ремонт выписной комнаты ГАУЗ «ОМПЦ»
        </motion.p>
      </div>
    </section>
  );
}
