import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useContent } from '../../hooks/useContent';
import type { PartnershipData } from '../../types/content';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export default function PartnershipAbout() {
  const { data, loading, error } = useContent<PartnershipData>('partnership');
  const aboutItems = data?.about ?? [];
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="partnership-about"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-12 md:mb-16 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Коротко о нас
        </motion.h2>

        {loading && (
          <div className="text-center py-12 text-text-muted">Загрузка...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">Ошибка загрузки</div>
        )}
        {!loading && !error && aboutItems.length === 0 && (
          <div className="text-center py-12 text-text-muted">Нет данных</div>
        )}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {aboutItems.map((item) => (
            <motion.div
              key={item.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="glass rounded-2xl p-6 md:p-8 flex items-start gap-4 hover:shadow-glass transition-all duration-300"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-pale border border-gold-primary/20 flex items-center justify-center text-gold-primary font-display font-semibold text-lg">
                {item.number.replace('.', '')}
              </span>
              <p className="text-text-dark text-base md:text-lg leading-relaxed pt-1.5">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
