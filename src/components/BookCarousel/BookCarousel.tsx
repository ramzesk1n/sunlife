import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface BookCarouselProps {
  bookImages: string[];
  bookLabels: string[];
  className?: string;
}

export default function BookCarousel({ bookImages, bookLabels, className = '' }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(scrollRef, { once: true, margin: '-10%' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.55;
      const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
      const clamped = Math.max(0, Math.min(newIndex, bookImages.length - 1));
      setActiveIndex(clamped);
      scrollRef.current.scrollTo({
        left: clamped * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || isDragging) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.55;
    const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(newIndex, bookImages.length - 1)));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.55;
    setActiveIndex(index);
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        tabIndex={0}
        role="region"
        aria-label="Фотокниги — прокручиваемая галерея"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onScroll={handleScroll}
      >
        {bookImages.map((src, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={src}
              className="snap-center shrink-0 w-[55%] sm:w-[40%] md:w-[30%] lg:w-[25%] cursor-grab active:cursor-grabbing"
              onClick={() => scrollToIndex(idx)}
            >
              <div
                className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'scale-100 shadow-gold ring-2 ring-gold-primary/30'
                    : 'scale-95 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={src}
                    alt={`Фотокнига ${bookLabels[idx]}`}
                    className="w-full h-full object-cover"
                    width="640"
                    height="425"
                    draggable={false}
                  />
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-gradient-to-r from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-3 sm:mt-4">
        {bookImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className="w-8 h-8 shrink-0 flex items-center justify-center"
            aria-label={`Перейти к фотокниге ${idx + 1}`}
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'bg-gold-primary w-6'
                  : 'bg-gold-primary/30 hover:bg-gold-primary/50 w-2'
              }`}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
