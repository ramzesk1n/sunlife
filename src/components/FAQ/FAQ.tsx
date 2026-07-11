import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useContent } from '../../hooks/useContent';
import type { FAQData } from '../../types/content';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export default function FAQ() {
  const { data, loading, error } = useContent<FAQData>('faq');
  const faqItems = data?.categories?.customer ?? [];
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Часто задаваемые вопросы
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Ответы на самые популярные вопросы о фотосъёмке выписки
        </motion.p>

        {loading && (
          <div className="text-center py-12 text-text-muted">Загрузка...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">Ошибка загрузки FAQ</div>
        )}
        {!loading && !error && faqItems.length === 0 && (
          <div className="text-center py-12 text-text-muted">Нет вопросов</div>
        )}
        <motion.div
          className="space-y-3"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {faqItems.map((item) => (
            <motion.div
              key={item.id}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-2/50 transition-colors duration-200"
                aria-expanded={openId === item.id}
              >
                <span className="font-display font-semibold text-gold-dark pr-4 text-left uppercase tracking-wider text-base md:text-lg">
                  {item.question}
                </span>
                <motion.span
                  className="text-gold-primary flex-shrink-0 ml-2"
                  animate={{ rotate: openId === item.id ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openId === item.id && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: 'easeOut' }}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-text-muted text-base leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
