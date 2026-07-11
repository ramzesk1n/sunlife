import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  partnershipPrices,
  partnershipNewborn,
  partnershipNewbornExtras,
} from '../../content/partnership';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export default function PartnershipPricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="partnership-pricing"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream-2"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-2 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Прейскурант цен
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-xl mx-auto mb-10 md:mb-14"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          5 пакетов от 2300 до 7500 рублей
        </motion.p>

        <motion.div
          className="glass rounded-2xl p-6 md:p-8 mb-8"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {partnershipPrices.map((item) => (
            <motion.div
              key={item.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 border-b border-gold-primary/10 last:border-b-0"
            >
              <span className="font-display font-semibold text-gold-dark uppercase tracking-wider text-base md:text-lg">
                {item.title}
              </span>
              <span className="font-display text-xl md:text-2xl text-gold-primary whitespace-nowrap">
                {item.price}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-6 md:p-8"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <h3 className="text-xl md:text-2xl font-display font-semibold text-gold-primary-80 text-center mb-6 uppercase tracking-wider">
            Ньюборн фотосессия
          </h3>

          <div className="space-y-3 mb-6">
            {partnershipNewborn.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-gold-primary/10 last:border-b-0"
              >
                <span className="font-display font-semibold text-gold-dark uppercase tracking-wider text-base">
                  {item.title}
                </span>
                <span className="font-display text-lg text-gold-primary whitespace-nowrap">
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gold-pale rounded-xl p-4 md:p-5">
            <p className="font-display font-semibold text-gold-dark uppercase tracking-wider text-sm mb-2">
              Дополнительная печать:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-muted text-base">
              {partnershipNewbornExtras.map((extra, idx) => (
                <li key={idx}>{extra}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
