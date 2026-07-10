import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cities, geographyText } from '../../content/geography';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export default function Geography() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="geography"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-gold-primary-80 mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Где мы работаем
        </motion.h2>

        <motion.p
          className="text-text-muted mb-10 max-w-2xl mx-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Наши специалисты выезжают на проекты в города по всей России
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {cities.map((city) => (
            <motion.span
              key={city.name}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="inline-flex items-center px-5 py-2.5 glass rounded-full text-gold-dark text-sm font-display uppercase tracking-wider hover:shadow-gold transition-shadow duration-300 cursor-default"
              title={city.region}
            >
              <span className="w-2 h-2 rounded-full bg-gold-primary mr-2" aria-hidden="true" />
              {city.name}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          className="text-text-muted text-sm max-w-xl mx-auto"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          {geographyText}
        </motion.p>
      </div>
    </section>
  );
}
