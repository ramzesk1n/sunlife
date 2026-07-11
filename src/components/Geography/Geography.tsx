import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useContent } from '../../hooks/useContent';
import type { GeographyData } from '../../types/content';
import RussiaMap from '../RussiaMap/RussiaMap';

export default function Geography() {
  const { data, loading, error } = useContent<GeographyData>('geography');
  const geographyText = data?.geographyText ?? '';
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="geography"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Где мы работаем
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-14"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Наши специалисты выезжают на проекты в города по всей России
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <RussiaMap />
        </motion.div>

        {loading && (
          <div className="text-center py-12 text-text-muted">Загрузка...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">Ошибка загрузки</div>
        )}
        {!loading && !error && (
        <motion.p
          className="text-text-muted text-base md:text-lg max-w-3xl mx-auto mt-10 md:mt-14 text-center"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          {geographyText}
        </motion.p>
        )}
      </div>
    </section>
  );
}
