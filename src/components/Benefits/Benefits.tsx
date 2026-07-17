import { useRef, useEffect, useState } from 'react';
import benefitsData from '../../content/benefits.json';

const iconMap: Record<string, React.ReactNode> = {
  camera: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  tag: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  truck: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 17h4V5H6v12h2" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-10%' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const headingClass = prefersReducedMotion
    ? ''
    : `transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`;

  const cardBaseClass = prefersReducedMotion
    ? ''
    : `transition-all duration-500 ease-out opacity-0 translate-y-10 scale-95`;

  const cardVisibleClass = 'opacity-100 translate-y-0 scale-100';

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider ${headingClass}`}
        >
          Гильдия фотографов САН ЛАЙФ - это
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {benefitsData.benefits.map((benefit, index) => (
            <article
              key={benefit.id}
              className={`glass rounded-2xl p-8 hover:shadow-glass transition-all duration-300 group ${cardBaseClass} ${isInView ? cardVisibleClass : ''}`}
              style={prefersReducedMotion ? undefined : { transitionDelay: `${index * 120}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gold-pale border border-gold-primary/20 flex items-center justify-center mb-5 text-gold-primary group-hover:bg-gold-primary group-hover:text-cream transition-colors duration-300">
                {iconMap[benefit.icon] ?? (
                  <span className="text-2xl" aria-hidden="true">✦</span>
                )}
              </div>
              <h3 className="font-display text-lg md:text-xl font-light text-gold-primary-80 uppercase tracking-wider mb-3">
                {benefit.title}
              </h3>
              <p className="text-text-muted text-base leading-relaxed">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
