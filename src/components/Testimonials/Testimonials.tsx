import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import reviewsData from '../../content/reviews.json';

const VISIBLE_COUNT_DESKTOP = 3;
const VISIBLE_COUNT_MOBILE = 1;
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '18.75rem' : '-18.75rem',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-18.75rem' : '18.75rem',
    opacity: 0,
  }),
};

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const reviews = reviewsData.reviews;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visibleCount = isMobile ? VISIBLE_COUNT_MOBILE : VISIBLE_COUNT_DESKTOP;
  const totalPages = Math.ceil(reviews.length / visibleCount);

  const goToPage = useCallback((newPage: number) => {
    setDirection(newPage > page ? 1 : -1);
    setPage(newPage);
  }, [page]);

  const nextPage = useCallback(() => {
    if (page < totalPages - 1) goToPage(page + 1);
  }, [page, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 0) goToPage(page - 1);
  }, [page, goToPage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextPage, prevPage]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) nextPage();
      else prevPage();
    }
  }, [nextPage, prevPage]);

  const visibleReviews = reviews.slice(
    page * visibleCount,
    page * visibleCount + visibleCount
  );

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Что говорят наши клиенты
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          100+ реальных отзывов от счастливых мам и семей
        </motion.p>

        <div className="relative">
          <button
            type="button"
            onClick={prevPage}
            disabled={page === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 rounded-xl glass flex items-center justify-center text-gold-dark disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-gold transition-all duration-300"
            aria-label="Предыдущие отзывы"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextPage}
            disabled={page === totalPages - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 rounded-xl glass flex items-center justify-center text-gold-dark disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-gold transition-all duration-300"
            aria-label="Следующие отзывы"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="px-2 md:px-12"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={shouldReduceMotion ? undefined : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
              >
                {visibleReviews.map((review) => (
                  <article
                    key={review.id}
                    className="glass rounded-2xl p-8 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-12 h-12 rounded-full object-cover border border-gold-primary/20 flex-shrink-0"
                          loading="lazy"
                          width="48"
                          height="48"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gold-pale border border-gold-primary/20 flex items-center justify-center text-gold-dark font-display text-base flex-shrink-0">
                          {review.author.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display font-light text-gold-dark text-base uppercase tracking-wider truncate">
                          {review.author}
                        </h3>
                        {(review as any).city && (
                          <p className="text-sm text-text-muted">{(review as any).city}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-text-dark text-base leading-relaxed flex-grow">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    {review.date && (
                      <p className="text-sm text-text-muted mt-4 pt-4 border-t border-gold-primary/10">
                        {review.date}
                      </p>
                    )}
                  </article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                className="w-8 h-8 shrink-0 flex items-center justify-center"
                aria-label={`Страница отзывов ${i + 1}`}
                aria-current={i === page ? 'true' : undefined}
              >
                <span
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === page
                      ? 'bg-gold-primary w-6'
                      : 'bg-gold-light w-2.5 hover:bg-gold-primary/70'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
