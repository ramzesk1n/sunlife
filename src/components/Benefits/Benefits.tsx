import { useRef } from 'react';
import { benefits } from '../../content/benefits';

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Гильдия фотографов САН ЛАЙФ — это
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {benefits.map((benefit) => (
            <article
              key={benefit.id}
              className="bg-white-warm rounded-2xl p-6 shadow-card hover:shadow-warm transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center mb-4 text-terracotta-400">
                <span className="text-xl" aria-hidden="true">
                  {benefit.icon === 'camera' && '📷'}
                  {benefit.icon === 'tag' && '🏷️'}
                  {benefit.icon === 'truck' && '🚚'}
                  {benefit.icon === 'clock' && '⚡'}
                </span>
              </div>
              <h3 className="font-serif text-xl text-brown-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
