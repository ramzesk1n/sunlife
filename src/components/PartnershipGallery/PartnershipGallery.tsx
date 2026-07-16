import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import partnershipData from '../../content/partnership.json';
import Lightbox from '../Lightbox/Lightbox';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

const PLACEHOLDER_REGEX = /placeholder-\d+\.(jpg|jpeg|png|webp)/i;

function isValidPhoto(photo: { src?: string; alt?: string }) {
  return photo?.src && !PLACEHOLDER_REGEX.test(photo.src);
}

export default function PartnershipGallery() {
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

  const projects = ((partnershipData as any).projects || [])
    .map((project: any) => ({
      ...project,
      photos: (project.photos || []).filter(isValidPhoto),
    }))
    .filter((project: any) => project.photos.length > 0);

  return (
    <section
      ref={sectionRef}
      id="partnership-portfolio"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Портфолио партнёрских проектов
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-3xl mx-auto mb-10 md:mb-14"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Реальные проекты для медицинских учреждений
        </motion.p>

        {projects.length === 0 ? (
          <p className="text-text-muted text-center">Проекты пока не добавлены</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {projects.map((project: any) => {
              const photos = project.photos;
              const cover = photos[0]?.src;
              const photoCount = photos.length;
              return (
                <motion.div
                  key={project.id}
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-cream rounded-2xl overflow-hidden shadow-card hover:shadow-glass transition-all duration-300 border border-gold-primary/10 group"
                >
                  <button
                    type="button"
                    className="relative w-full aspect-[4/3] overflow-hidden block"
                    onClick={() => openLightbox(photos, 0)}
                    aria-label={`Открыть галерею: ${project.title}`}
                  >
                    <img
                      src={cover}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-primary text-2xl">
                        🔍
                      </span>
                    </div>

                    {photoCount > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-cream text-sm font-display px-3 py-1 rounded-full">
                        {photoCount} фото
                      </div>
                    )}
                  </button>

                  <div className="p-6">
                    <h3 className="text-xl font-display font-medium text-text-primary mb-2">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        {project.description}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => openLightbox(photos, 0)}
                      className="text-gold-primary text-sm font-display uppercase tracking-wider hover:underline transition-all"
                    >
                      Смотреть проект
                    </button>
                  </div>
                </motion.div>
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
