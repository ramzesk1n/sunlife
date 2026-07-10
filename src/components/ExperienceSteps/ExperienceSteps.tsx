import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { steps, introText } from '../../content/steps';

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
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream"
    >
      <div className="max-w-[88rem] mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-gold-primary text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Почему мамы выбирают нас?
        </motion.h2>

        <motion.p
          className="text-text-muted text-center max-w-2xl mx-auto mb-14 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {introText}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="group relative flex flex-col lg:flex-row h-full min-h-[320px] lg:min-h-[360px] overflow-hidden rounded-2xl bg-gold-secondary shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
            >
              <div className="relative z-10 flex flex-1 flex-col justify-start p-4 lg:p-4 lg:w-[55%]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-display font-semibold text-gold-secondary shadow-sm">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-display text-sm font-semibold uppercase leading-tight tracking-wide text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  {step.description}
                </p>
              </div>

              <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-64 lg:h-auto lg:w-[45%]">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  width="279"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
