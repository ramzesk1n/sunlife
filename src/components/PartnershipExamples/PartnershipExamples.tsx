import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import partnershipData from '../../content/partnership.json';
import Lightbox from '../Lightbox/Lightbox';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const PLACEHOLDER_REGEX = /placeholder-\d+\.(jpg|jpeg|png|webp)/i;

function isValidPhoto(photo: { src?: string; alt?: string }) {
  return photo?.src && !PLACEHOLDER_REGEX.test(photo.src);
}

export default function PartnershipExamples() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((photos: { src: string; alt: string }[], index: number) => {
    setLightboxImages(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const examples = ((partnershipData as any).examples || [])
    .map((project: any) => ({
      ...project,
      photos: (project.photos || []).filter(isValidPhoto),
    }))
    .filter((project: any) => project.photos.length > 0);

  return (
    <section
      ref={sectionRef}
      id="partnership-examples"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cream-2"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Примеры работ
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto mb-10 md:mb-14"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Фотосъёмка выписки в роддомах-партнёрах
        </motion.p>

        {examples.length === 0 ? (
          <p className="text-text-muted text-center">Проекты пока не добавлены</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {examples.map((project: any) => {
              const photos = project.photos;
              const cover = photos[0]?.src;
              const photoCount = photos.length;
              return (
                <motion.button
                  key={project.id}
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => openLightbox(photos, 0)}
                  className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-cream-2 border border-gold-primary/10 shadow-card hover:shadow-glass transition-all duration-300"
                  aria-label={`Открыть галерею: ${project.title}`}
                >
                  <img
                    src={cover}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-primary text-lg">
                      🔍
                    </span>
                  </div>

                  {photoCount > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-cream text-xs font-display px-2 py-1 rounded-full">
                      {photoCount} фото
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-cream text-xs font-display uppercase tracking-wider text-center leading-tight">
                      {project.title}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      <Lightbox
        images={lightboxImages}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={closeLightbox}
      />
    </section>
  );
}
