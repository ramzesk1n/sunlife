import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContactForm from '../ContactForm/ContactForm';

/* Register GSAP plugin once */
gsap.registerPlugin(ScrollTrigger);

/* Check for reduced motion preference */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  /* Lazy GSAP init via IntersectionObserver */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ctx: gsap.Context | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefersReducedMotion) {
          ctx = gsap.context(() => {
            /* Parallax background */
            if (bgRef.current) {
              gsap.to(bgRef.current, {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              });
            }

            /* Content fade + slight rise */
            if (contentRef.current) {
              gsap.fromTo(
                contentRef.current.children,
                { y: 40, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1,
                  stagger: 0.15,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                  },
                }
              );
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

  /* Close modal on Escape */
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
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* Background layer */}
        <div
          ref={bgRef}
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          aria-hidden="true"
        >
          {/* Placeholder: replace with real hero image (AVIF/WebP, width/height required) */}
          <div className="w-full h-full bg-gradient-to-br from-sand-200 via-sand-100 to-terracotta-100" />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-sand-100/60 via-transparent to-sand-100/30" />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="relative z-10 max-w-4xl mx-auto text-center px-6 py-24"
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-brown-800 mb-6 text-balance leading-tight">
            Фотограф на выписку из роддома
          </h1>

          <div className="space-y-3 text-base sm:text-lg md:text-xl text-brown-600 max-w-2xl mx-auto mb-10">
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
            className="inline-flex items-center justify-center px-8 py-4 bg-terracotta-400 hover:bg-terracotta-500 active:bg-terracotta-600 text-white font-medium rounded-full transition-colors duration-300 shadow-warm hover:shadow-warm-lg text-base sm:text-lg"
          >
            Забронировать дату
          </button>
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brown-900/50 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-sand-50 rounded-2xl shadow-warm-lg">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-brown-600 transition-colors"
              aria-label="Закрыть форму"
            >
              ✕
            </button>

            <div className="p-6 md:p-8">
              <h2 className="font-serif text-2xl md:text-3xl text-brown-800 mb-2">
                Оставить заявку
              </h2>
              <p className="text-brown-500 mb-6">
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
