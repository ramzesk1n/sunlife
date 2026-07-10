import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { pricingPackages } from '../../content/pricing';
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
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
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
    ? pricingPackages.find((p) => p.id === selectedPackage)?.name ?? ''
    : '';

  return (
    <>
      <section
        ref={sectionRef}
        id="pricing"
        className="py-20 md:py-28 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Выберите свой формат
          </motion.h2>

          <motion.p
            className="text-brown-500 text-center max-w-xl mx-auto mb-12"
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
            {pricingPackages.map((pkg) => (
              <motion.article
                key={pkg.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -4 }}
                transition={{ duration: 0.3 }}
                className={`relative bg-white-warm rounded-2xl p-6 shadow-card hover:shadow-warm-lg transition-shadow duration-300 flex flex-col ${
                  pkg.popular ? 'ring-2 ring-terracotta-400' : ''
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-terracotta-400 text-white text-xs font-medium rounded-full shadow-warm">
                    Популярный
                  </span>
                )}

                <div className="flex-grow">
                  <h3 className="font-serif text-xl text-brown-800 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-brown-500 text-sm mb-4">{pkg.description}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-serif text-3xl md:text-4xl text-brown-800">
                      {pkg.price.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-brown-500 text-lg">{pkg.currency}</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-brown-600"
                      >
                        <span
                          className="text-terracotta-400 mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 8 6 11 13 4" />
                          </svg>
                        </span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-xs text-terracotta-600 bg-terracotta-50 rounded-lg p-3 mb-4">
                      ⚠️ {pkg.note}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openModal(pkg.id)}
                  className={`w-full py-3 px-4 rounded-full font-medium transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-terracotta-400 hover:bg-terracotta-500 text-white shadow-warm hover:shadow-warm-lg'
                      : 'bg-sand-100 hover:bg-sand-200 text-brown-700'
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
          <div className="absolute inset-0 bg-brown-900/50 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-sand-50 rounded-2xl shadow-warm-lg">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-brown-600 transition-colors z-10"
              aria-label="Закрыть форму"
            >
              ✕
            </button>

            <div className="p-6 md:p-8">
              <h2 className="font-serif text-2xl md:text-3xl text-brown-800 mb-2">
                Оставить заявку
              </h2>
              {selectedPackageName && (
                <p className="text-terracotta-500 text-sm mb-2">
                  Выбран пакет: <strong>{selectedPackageName}</strong>
                </p>
              )}
              <p className="text-brown-500 mb-6">
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
