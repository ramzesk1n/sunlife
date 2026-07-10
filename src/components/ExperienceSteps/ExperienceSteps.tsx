import { useRef } from 'react';
import { steps, introText } from '../../content/steps';

export default function ExperienceSteps() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="experience-steps"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Почему мамы выбирают нас?
        </h2>
        <p className="text-brown-500 text-center max-w-2xl mx-auto mb-12">
          {introText}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <article
              key={step.id}
              className="bg-white-warm rounded-2xl p-6 shadow-card text-center"
            >
              {step.stat && (
                <span className="inline-block font-serif text-3xl text-terracotta-400 mb-3">
                  {step.stat}
                </span>
              )}
              <h3 className="font-serif text-lg text-brown-800 mb-2">
                {step.title}
              </h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
