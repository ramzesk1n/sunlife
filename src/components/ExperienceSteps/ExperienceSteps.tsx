import { useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { steps, introText } from '../../content/steps';

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
          className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-gold-primary text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Почему мамы выбирают нас?
        </motion.h2>

        <motion.p
          className="text-text-muted text-center max-w-2xl mx-auto mb-14 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: '1.25rem' }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {introText}
        </motion.p>
      </div>

      {/* Desktop stacking cards */}
      <div className="about-cards-container relative hidden lg:block h-[420vh]">
        <div className="about-cards-pinned h-screen w-full flex items-center justify-center px-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="about-card absolute w-full max-w-5xl opacity-0"
              style={{ zIndex: index + 1 }}
            >
              <article className="mx-auto w-full rounded-2xl bg-white p-2 shadow-xl">
                <div className="flex overflow-hidden rounded-xl bg-gold-lighter">
                  <div className="flex-1 p-7">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-display font-semibold text-gold-primary shadow-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-dark mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-muted">
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
            className="mx-auto mb-6 w-full max-w-4xl rounded-2xl bg-white p-2 shadow-xl"
          >
            <div className="flex flex-col overflow-hidden rounded-xl bg-gold-lighter">
              <div className="flex-1 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-display font-semibold text-gold-primary shadow-sm">
                  {index + 1}
                </div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
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
    </section>
  );
}
