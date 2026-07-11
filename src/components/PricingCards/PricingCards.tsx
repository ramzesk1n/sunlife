import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import pricingData from '../../content/pricing.json';
import ContactForm from '../ContactForm/ContactForm';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export default function PricingCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback((packageId: string) => {
    setSelectedPackage(packageId);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  }, []);

  const selectedPackageName = selectedPackage
    ? pricingData.packages.find((p) => p.id === selectedPackage)?.name ?? ''
    : '';

  return (
    <>
      <section
        ref={sectionRef}
        id="pricing"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Выберите свой формат
          </motion.h2>

          <motion.p
            className="text-text-muted text-center text-base md:text-lg max-w-xl mx-auto mb-12"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            6 пакетов под любой бюджет и пожелания
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {pricingData.packages.map((pkg) => (
              <motion.article
                key={pkg.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -4 }}
                transition={{ duration: 0.3 }}
                className={`relative glass rounded-2xl p-8 flex flex-col hover:shadow-glass transition-shadow duration-300 ${
                  pkg.popular ? 'border-gold-primary/40' : ''
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-primary text-cream text-sm font-display uppercase tracking-wider rounded-full shadow-gold">
                    Популярный
                  </span>
                )}

                <div className="flex-grow">
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-gold-primary-80 uppercase tracking-wider mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-text-muted text-base mb-4">{pkg.description}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-display text-4xl md:text-5xl text-gold-primary uppercase tracking-wider">
                      {pkg.price.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-text-muted text-lg">{pkg.currency}</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-base text-text-dark"
                      >
                        <span className="text-gold-primary mt-0.5 flex-shrink-0" aria-hidden="true">
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 8 6 11 13 4" />
                          </svg>
                        </span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-sm text-gold-dark bg-gold-pale rounded-lg p-3 mb-4">
                      ⚠️ {pkg.note}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openModal(pkg.id)}
                  className={`w-full py-4 px-4 rounded-2xl font-display font-semibold uppercase tracking-wider transition-all duration-300 ${
                    pkg.popular
                      ? 'border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-cream'
                      : 'border border-gold-primary/40 text-gold-dark hover:bg-gold-primary hover:text-cream hover:border-gold-primary'
                  }`}
                >
                  Выбрать
                </button>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Форма заявки"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="absolute inset-0 bg-text-dark/40 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-cream-2 hover:bg-cream-dark text-gold-dark transition-colors z-10"
              aria-label="Закрыть форму"
            >
              ✕
            </button>

            <div className="p-6 md:p-8">
              <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 mb-2 uppercase tracking-wider">
                Оставить заявку
              </h2>
              {selectedPackageName && (
                <p className="text-gold-primary text-sm mb-2 uppercase tracking-wider">
                  Выбран пакет: <strong>{selectedPackageName}</strong>
                </p>
              )}
              <p className="text-text-muted mb-6">
                Заполните форму, и мы свяжемся с вами
              </p>
              <ContactForm inline prefillPackage={selectedPackageName} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
