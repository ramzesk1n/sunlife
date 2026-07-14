import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import partnershipData from '../../content/partnership.json';

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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="partnership-about"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-12 md:mb-16 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Коротко о нас
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {partnershipData.about.map((item) => (
            <motion.div
              key={item.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="glass rounded-2xl p-6 md:p-8 flex items-start gap-4 hover:shadow-glass transition-all duration-300"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-pale border border-gold-primary/20 flex items-center justify-center text-gold-primary font-display font-light text-lg">
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
