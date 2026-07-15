import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import galleryData from '../content/gallery-portfolio.json';
import Lightbox from '../components/Lightbox/Lightbox';

const breakpointColumns = {
  default: 3,
  1024: 3,
  768: 2,
  480: 1,
};

export default function GalleryPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());

  const categories = [{ id: 'all', label: 'Все' }, ...galleryData.categories];

  const filteredImages: typeof galleryData.images = activeCategory === 'all'
    ? galleryData.images
    : galleryData.images.filter(img => img.category === activeCategory);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Intersection Observer for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleImages(prev => new Set(prev).add(idx));
          }
        });
      },
      { rootMargin: '50px' }
    );

    document.querySelectorAll('.gallery-item').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredImages]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream-2 border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="font-display text-3xl md:text-4xl lg:text-5xl text-gold-primary-80 uppercase tracking-wider mb-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Портфолио
          </motion.h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto">
            {galleryData.images.length} фотографий из наших съёмок в роддомах Уфы
          </p>
        </div>
      </div>

      <section ref={sectionRef} className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-display text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gold-primary text-cream shadow-gold'
                    : 'bg-cream-2 text-gold-dark border border-gold-primary/20 hover:bg-gold-primary/10'
                }`}
              >
                {cat.label}
                {cat.id !== 'all' && 'count' in cat && (
                  <span className="ml-2 text-xs opacity-70">
                    {(cat as any).count}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Counter */}
          <p className="text-text-muted text-sm text-center mb-6">
            Показано {filteredImages.length} из {galleryData.images.length} фото
          </p>

          {/* Masonry Grid */}
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredImages.map((img: typeof galleryData.images[0], i: number) => (
              <button
                key={img.src}
                data-index={i}
                onClick={() => openLightbox(i)}
                className={`gallery-item mb-4 w-full rounded-xl overflow-hidden bg-cream-2 border border-gold-primary/10 shadow-card hover:shadow-glass transition-all duration-500 cursor-pointer group ${
                  visibleImages.has(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ willChange: 'transform, opacity' }}
              >
                <img
                  src={img.thumb}
                  alt={img.alt}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cream text-lg bg-black/40 rounded-full w-10 h-10 flex items-center justify-center">
                    🔍
                  </span>
                </div>
              </button>
            ))}
          </Masonry>
        </div>
      </section>

      <Lightbox
        images={filteredImages.map((img: typeof galleryData.images[0]) => ({ src: img.src, alt: img.alt }))}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={closeLightbox}
      />
    </div>
  );
}
