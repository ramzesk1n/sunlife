import { useRef } from 'react';

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Галерея эмоций
        </h2>
        <p className="text-brown-500 text-center max-w-xl mx-auto mb-12">
          Реальные моменты счастья из наших съёмок
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Placeholder для изображений — реальные файлы нужно запросить у заказчика */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-sand-200 rounded-xl flex items-center justify-center text-brown-400"
            >
              <span className="text-sm">Фото {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
