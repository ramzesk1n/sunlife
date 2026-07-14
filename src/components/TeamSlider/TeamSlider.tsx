import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import partnershipData from '../../content/partnership.json';

export default function TeamSlider() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const team = partnershipData.team;

  useEffect(() => {
    if (shouldReduceMotion || !trackRef.current || team.length === 0) return;

    const track = trackRef.current;
    let animationId: number;
    let offset = 0;
    const speed = 0.4;

    const animate = () => {
      if (!isPaused) {
        offset -= speed;
        const firstChild = track.firstElementChild as HTMLElement | null;
        if (firstChild) {
          const itemWidth = firstChild.offsetWidth;
          const gap = 24;
          const totalItemWidth = itemWidth + gap;
          const halfWidth = (team.length * totalItemWidth);

          if (Math.abs(offset) >= halfWidth) {
            offset = 0;
          }
        }
        track.style.transform = `translateX(${offset}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, shouldReduceMotion, team.length]);

  const duplicatedTeam = [...team, ...team];

  return (
    <section
      ref={sectionRef}
      id="team-slider"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cream-2 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto mb-8 md:mb-10">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Наша команда
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Профессионалы, которые создают ваши счастливые моменты
        </motion.p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-cream-2 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-cream-2 to-transparent z-10" />

        <div className="overflow-hidden">
          <div ref={trackRef} className="flex gap-6 will-change-transform w-max mx-auto">
          {duplicatedTeam.map((member, idx) => (
            <div
              key={`${member.id}-${idx}`}
              className="flex-shrink-0 w-48 md:w-56"
            >
              <div className="glass rounded-2xl p-3 text-center hover:shadow-glass transition-all duration-300">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gold-pale mb-3">
                  {member.src && !member.src.includes('placeholder') ? (
                    <img
                      src={member.src}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold-primary/40">
                      <span className="text-4xl font-display uppercase">{member.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-base md:text-lg font-light text-gold-primary-80 uppercase tracking-wider mb-1">
                  {member.name}
                </h3>
                <p className="text-text-muted text-sm">{member.role}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
