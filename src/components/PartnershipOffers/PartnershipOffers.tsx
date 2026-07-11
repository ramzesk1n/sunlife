import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import partnershipData from '../../content/partnership.json';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export default function PartnershipOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="partnership-offers"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream-2"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Что мы можем предложить в рамках сотрудничества
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-2xl mx-auto mb-12 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Работаем как часть вашей экосистемы: инвестируем в интерьер, помогаем персоналу и создаём контент
        </motion.p>

        <motion.div
          className="relative"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* vertical line */}
          <div className="absolute left-6 md:left-8 top-4 bottom-4 w-0.5 bg-gold-primary/20 hidden md:block" />

          <div className="space-y-8 md:space-y-10">
            {partnershipData.offers.map((offer) => (
              <motion.div
                key={offer.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
                className="relative pl-0 md:pl-24"
              >
                <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 rounded-full bg-gold-primary text-cream font-display font-bold text-xl items-center justify-center border-4 border-cream-2 z-10">
                  {offer.number}
                </div>

                <div className="glass rounded-2xl p-6 md:p-8 hover:shadow-glass transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3 md:hidden">
                    <span className="w-10 h-10 rounded-full bg-gold-primary text-cream font-display font-bold text-base flex items-center justify-center">
                      {offer.number}
                    </span>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-gold-primary-80 uppercase tracking-wider">
                      {offer.title}
                    </h3>
                  </div>

                  <h3 className="hidden md:block font-display text-xl md:text-2xl font-semibold text-gold-primary-80 uppercase tracking-wider mb-3">
                    {offer.title}
                  </h3>

                  <p className="text-text-muted text-base md:text-lg leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
