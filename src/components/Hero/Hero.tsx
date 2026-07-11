import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContactForm from '../ContactForm/ContactForm';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ctx: gsap.Context | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefersReducedMotion) {
          ctx = gsap.context(() => {
            if (imageRef.current) {
              gsap.to(imageRef.current, {
                yPercent: 15,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              });
            }
          }, section);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        className="relative min-h-[100dvh] flex items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text content */}
            <motion.div
              ref={contentRef}
              initial={prefersReducedMotion ? false : { opacity: 0, x: '-2.5rem' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="order-2 lg:order-1"
            >
              <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-gold-primary-80 uppercase tracking-[0.1em] mb-6 text-balance">
                  Фотограф на выписку из роддома
                </h1>

                <div className="space-y-3 text-base sm:text-lg text-text-dark mb-8">
                  <p>Этот день не повторить!</p>
                  <p>Как сохранить в памяти это важное событие?</p>
                  <p>Какие воспоминания оставить детям, когда они вырастут?</p>
                  <p className="text-balance">
                    Улыбки, слезы, объятия, поздравления — такие моменты счастья можно
                    поймать на камеру!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center justify-center px-8 py-4 border border-gold-primary text-gold-primary font-display font-semibold uppercase tracking-[0.0625em] rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300"
                >
                  Забронировать дату
                </button>
              </div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: '2.5rem' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="order-1 lg:order-2"
            >
              <div
                ref={imageRef}
                className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-glass bg-gold-pale"
              >
                {/* Placeholder: заменить на реальное фото newborn foots */}
                <div className="absolute inset-0 flex items-center justify-center text-gold-primary/40">
                  <div className="text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 w-20 h-20">
                      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                      <path d="M4 16s1.5-2 5-2 5 2 5 2" />
                      <path d="M4 12s1.5-2 5-2 5 2 5 2" />
                      <path d="M19 12v8" />
                      <circle cx="12" cy="5" r="3" />
                    </svg>
                    <span className="text-sm uppercase tracking-widest">Hero Image</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
              <p className="text-text-muted mb-6">
                Заполните форму, и мы свяжемся с вами
              </p>
              <ContactForm inline />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
