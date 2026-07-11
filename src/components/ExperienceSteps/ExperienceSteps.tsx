import { useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../../hooks/useContent';
import type { StepsData } from '../../types/content';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut' as const,
    },
  },
};

export default function ExperienceSteps() {
  const { data, loading, error } = useContent<StepsData>('steps');
  const steps = data?.steps ?? [];
  const introText = data?.introText ?? '';
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    let mm: gsap.MatchMedia | null = null;

    mm = gsap.matchMedia();
    mm.add('(min-width: 64rem)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.about-card');
      const container = sectionRef.current?.querySelector('.about-cards-container');
      const pinned = sectionRef.current?.querySelector('.about-cards-pinned');

      if (!container || !pinned || cards.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: pinned,
          pinSpacing: false,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) {
          tl.set(card, { opacity: 1, scale: 1, y: 0 });
        } else {
          tl.fromTo(
            card,
            { y: '80vh', opacity: 0, scale: 0.92 },
            { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
            index - 1
          );
        }

        if (index < cards.length - 1) {
          tl.to(
            card,
            { scale: 0.9, y: '-7.5rem', opacity: 0.25, duration: 0.7 },
            index + 0.85
          );
        }
      });

      return () => {
        tl.kill();
      };
    });

    return () => mm?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Почему мамы выбирают нас?
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-2xl mx-auto mb-14 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {introText}
        </motion.p>
      </div>

        {loading && (
          <div className="text-center py-12 text-text-muted">Загрузка...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">Ошибка загрузки</div>
        )}
        {!loading && !error && steps.length === 0 && (
          <div className="text-center py-12 text-text-muted">Нет данных</div>
        )}
        {!loading && !error && steps.length > 0 && (
        <>
      {/* Desktop stacking cards */}
      <div className="about-cards-container relative hidden lg:block h-[420vh]">
        <div className="about-cards-pinned h-screen w-full flex items-center justify-center px-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="about-card absolute w-full max-w-5xl opacity-0"
              style={{ zIndex: index + 1 }}
            >
              <article className="mx-auto w-full rounded-3xl bg-white p-3 shadow-xl">
                <div className="flex overflow-hidden rounded-2xl bg-gold-lighter">
                  <div className="flex-1 p-8 md:p-10 lg:p-12">
                    <div className="mb-4 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white text-xl md:text-2xl font-display font-semibold text-gold-primary shadow-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold uppercase tracking-wide text-text-dark mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base md:text-lg leading-relaxed text-text-muted">
                      {step.description}
                    </p>
                  </div>

                  <div className="relative w-[42%] shrink-0 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile plain cards */}
      <motion.div
        className="relative max-w-5xl mx-auto lg:hidden"
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {steps.map((step, index) => (
          <motion.article
            key={step.id}
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mx-auto mb-6 w-full max-w-4xl rounded-3xl bg-white p-3 shadow-xl"
          >
            <div className="flex flex-col overflow-hidden rounded-2xl bg-gold-lighter">
              <div className="flex-1 p-6 md:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-display font-semibold text-gold-primary shadow-sm">
                  {index + 1}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold uppercase tracking-wide text-text-dark mb-3">
                  {step.title}
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </div>

              <div className="relative h-52 w-full shrink-0 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
        </>
        )}
    </section>
  );
}
