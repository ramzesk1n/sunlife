import { useRef } from 'react';
import { pricingPackages } from '../../content/pricing';

export default function PricingCards() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Выберите свой формат
        </h2>
        <p className="text-brown-500 text-center max-w-xl mx-auto mb-12">
          6 пакетов под любой бюджет и пожелания
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPackages.map((pkg) => (
            <article
              key={pkg.id}
              className={`relative bg-white-warm rounded-2xl p-6 shadow-card transition-shadow duration-300 hover:shadow-warm ${
                pkg.popular ? 'ring-2 ring-terracotta-400' : ''
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-terracotta-400 text-white text-xs font-medium rounded-full">
                  Популярный
                </span>
              )}
              <h3 className="font-serif text-xl text-brown-800 mb-1">
                {pkg.name}
              </h3>
              <p className="text-brown-500 text-sm mb-4">{pkg.description}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-serif text-3xl text-brown-800">
                  {pkg.price.toLocaleString('ru-RU')}
                </span>
                <span className="text-brown-500">{pkg.currency}</span>
              </div>
              <ul className="space-y-2 mb-4">
                {pkg.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-brown-600"
                  >
                    <span className="text-terracotta-400 mt-0.5" aria-hidden="true">
                      ✓
                    </span>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              {pkg.note && (
                <p className="text-xs text-terracotta-500 bg-terracotta-50 rounded-lg p-3">
                  ⚠️ {pkg.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
