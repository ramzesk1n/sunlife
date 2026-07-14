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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: '-2.5rem' }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-2 lg:order-1 flex"
          >
            <div className="glass rounded-3xl p-8 sm:p-10 lg:p-12 flex flex-col justify-center w-full">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-gold-primary-80 uppercase tracking-[0.06em] mb-6 text-balance">
                <span className="block">Фотослужба</span>
                <span className="block">САН ЛАЙФ</span>
                <span className="block">- предложение</span>
                <span className="block">о сотрудничестве</span>
              </h1>

              <div className="space-y-4 text-base sm:text-lg text-text-dark mb-8">
                <p>
                  Фотослужба «Санлайф» - команда профессиональных фотографов, операторов и дизайнеров. Основной профиль - съёмка выписок из роддома.
                </p>
                <p>
                  Ищем партнёров в вашем городе. Предлагаем лучшие условия сотрудничества.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="self-start inline-flex items-center justify-center px-8 py-4 border border-gold-primary text-gold-primary text-base font-display font-light uppercase tracking-[0.0625em] rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300"
              >
                Стать партнёром
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: '2.5rem' }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="order-1 lg:order-2 flex"
          >
            <div className="relative w-full rounded-2xl overflow-hidden shadow-glass bg-gold-pale">
              <img
                src="/images/hero-image-partership-1600.webp"
                alt="Партнёрство с роддомами"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
