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

const statVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
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
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Почему мамы выбирают нас?
        </motion.h2>

        <motion.p
          className="text-brown-500 text-center max-w-2xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
              className="relative bg-white-warm rounded-2xl p-6 shadow-card text-center group"
            >
              {/* Step number indicator */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-sand-200 text-brown-500 text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>

              {step.stat && (
                <motion.span
                  className="inline-block font-serif text-3xl md:text-4xl text-terracotta-400 mb-3"
                  variants={shouldReduceMotion ? undefined : statVariants}
                >
                  {step.stat}
                </motion.span>
              )}
              <h3 className="font-serif text-lg text-brown-800 mb-2">
                {step.title}
              </h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
