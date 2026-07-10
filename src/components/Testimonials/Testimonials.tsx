import { useRef } from 'react';
import { reviews } from '../../content/reviews';

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Что говорят наши клиенты
        </h2>
        <p className="text-brown-500 text-center max-w-xl mx-auto mb-12">
          100+ реальных отзывов от счастливых мам и семей
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="bg-white-warm rounded-2xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sand-200 flex items-center justify-center text-brown-500 font-serif text-sm">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-brown-800 text-sm">
                    {review.author}
                  </h3>
                  {review.city && (
                    <p className="text-xs text-brown-400">{review.city}</p>
                  )}
                </div>
              </div>
              <p className="text-brown-600 text-sm leading-relaxed line-clamp-6">
                {review.text}
              </p>
              {review.date && (
                <p className="text-xs text-brown-400 mt-3">{review.date}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
