import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// Placeholder images — заменить на реальные при получении от заказчика
const galleryImages = [
  { src: '/images/placeholder-1.jpg', alt: 'Выписка из роддома — мама с малышом', width: 800, height: 1000 },
  { src: '/images/placeholder-2.jpg', alt: 'Папа держит новорождённого', width: 800, height: 1000 },
  { src: '/images/placeholder-3.jpg', alt: 'Первая семейная фотография', width: 800, height: 1000 },
  { src: '/images/placeholder-4.jpg', alt: 'Малыш в пелёнке', width: 800, height: 1000 },
  { src: '/images/placeholder-5.jpg', alt: 'Объятия родителей', width: 800, height: 1000 },
  { src: '/images/placeholder-6.jpg', alt: 'Счастливые моменты', width: 800, height: 1000 },
  { src: '/images/placeholder-7.jpg', alt: 'Встреча с родными', width: 800, height: 1000 },
  { src: '/images/placeholder-8.jpg', alt: 'Первый путь домой', width: 800, height: 1000 },
];

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

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Галерея эмоций
        </motion.h2>

        <motion.p
          className="text-brown-500 text-center max-w-xl mx-auto mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Реальные моменты счастья из наших съёмок
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {galleryImages.map((img, i) => (
            <motion.button
              key={i}
              variants={shouldReduceMotion ? undefined : itemVariants}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => openLightbox(i)}
              className="relative aspect-[4/5] bg-sand-200 rounded-xl overflow-hidden group cursor-pointer"
              aria-label={`Открыть фото: ${img.alt}`}
            >
              {/* Placeholder — заменить на <img> с реальными фото */}
              <div className="w-full h-full flex items-center justify-center text-brown-400 group-hover:scale-105 transition-transform duration-500">
                <span className="text-sm font-medium">{i + 1}</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brown-800/0 group-hover:bg-brown-800/20 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                  🔍
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        index={lightboxIndex}
        slides={galleryImages.map((img) => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
        }))}
        carousel={{ finite: true }}
        animation={{ fade: 300 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </section>
  );
}
