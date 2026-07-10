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
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
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
      id="experience-steps"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Почему мамы выбирают нас?
        </motion.h2>

        <motion.p
          className="text-text-muted text-center max-w-2xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {introText}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="glass rounded-2xl p-6 text-center group"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold-pale border border-gold-primary/20 text-gold-dark text-xs font-display font-semibold mb-3">
                {index + 1}
              </span>

              {step.stat && (
                <span className="block font-display text-3xl md:text-4xl text-gold-primary mb-3 uppercase tracking-wider">
                  {step.stat}
                </span>
              )}
              <h3 className="font-display text-base font-semibold text-gold-primary-80 uppercase tracking-wider mb-2">
                {step.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
