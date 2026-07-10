import { useRef, useState } from 'react';
import { faqItems } from '../../content/faq';

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Часто задаваемые вопросы
        </h2>
        <p className="text-brown-500 text-center max-w-xl mx-auto mb-12">
          Ответы на самые популярные вопросы о фотосъёмке выписки
        </p>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="bg-white-warm rounded-xl shadow-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-sand-50 transition-colors duration-200"
                aria-expanded={openId === item.id}
              >
                <span className="font-medium text-brown-800 pr-4">
                  {item.question}
                </span>
                <span
                  className={`text-terracotta-400 flex-shrink-0 transition-transform duration-300 ${
                    openId === item.id ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openId === item.id ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-5 pb-5 text-brown-500 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
