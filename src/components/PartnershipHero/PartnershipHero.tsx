import { useRef, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface PartnershipHeroProps {
  onOpenForm: () => void;
}

export default function PartnershipHero({ onOpenForm }: PartnershipHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  const scrollToForm = useCallback(() => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenForm();
    }
  }, [onOpenForm]);

  return (
    <section
      ref={sectionRef}
      id="partnership-hero"
      className="relative min-h-[100dvh] flex items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: '-2.5rem' }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            <div className="glass rounded-3xl p-8 sm:p-10 lg:p-12">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-gold-primary-80 uppercase tracking-[0.08em] mb-6 text-balance leading-tight">
                Фотослужба САН ЛАЙФ — предложение о сотрудничестве
              </h1>

              <div className="space-y-4 text-lg sm:text-xl text-text-dark mb-8">
                <p>
                  Фотослужба «Санлайф» — команда профессиональных фотографов, операторов и дизайнеров. Основной профиль — съёмка выписок из роддома.
                </p>
                <p>
                  Ищем партнёров в вашем городе. Предлагаем лучшие условия сотрудничества.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center justify-center px-8 py-4 border border-gold-primary text-gold-primary text-base font-display font-semibold uppercase tracking-[0.0625em] rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300"
              >
                Стать партнёром
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: '2.5rem' }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-glass bg-gold-pale">
              <div className="absolute inset-0 flex items-center justify-center text-gold-primary/40">
                <div className="text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 w-20 h-20">
                    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                    <path d="M4 16s1.5-2 5-2 5 2 5 2" />
                    <path d="M4 12s1.5-2 5-2 5 2 5 2" />
                    <path d="M19 12v8" />
                    <circle cx="12" cy="5" r="3" />
                  </svg>
                  <span className="text-sm uppercase tracking-widest">Hero Partnership</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
