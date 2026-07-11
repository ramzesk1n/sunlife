import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useContent } from '../../hooks/useContent';
import type { PartnershipData } from '../../types/content';
import Lightbox from '../Lightbox/Lightbox';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export default function PartnershipGallery() {
  const { data, loading, error } = useContent<PartnershipData>('partnership');
  const projects = data?.projects ?? [];
  const sectionRef = useRef<HTMLElement>(null);
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
    <section
      ref={sectionRef}
      id="partnership-gallery"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Портфолио партнёрских проектов
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Реальные проекты для медицинских учреждений и организаций
        </motion.p>

        {loading && (
          <div className="text-center py-12 text-text-muted">Загрузка...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">Ошибка загрузки</div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 text-text-muted">Нет проектов</div>
        )}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {projects.map((img, i) => (
            <motion.button
              key={img.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => openLightbox(i)}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-cream-2 border border-gold-primary/10 shadow-card hover:shadow-glass transition-all duration-300"
              aria-label={`Открыть фото: ${img.alt}`}
            >
              <div className="w-full h-full flex items-center justify-center text-gold-primary/40 group-hover:scale-105 transition-transform duration-500">
                <span className="text-sm font-display uppercase tracking-widest">{i + 1}</span>
              </div>

              <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-primary text-lg">
                  🔍
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-cream text-xs font-display uppercase tracking-wider text-center leading-tight">
                  {img.title}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <Lightbox
        images={projects.map((img) => ({ src: img.src, alt: img.alt }))}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={closeLightbox}
      />
    </section>
  );
}
