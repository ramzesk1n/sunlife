import { useRef, useState, useEffect } from 'react';

interface FormData {
  name: string;
  phone: string;
  contactMethod: 'telegram' | 'whatsapp' | 'phone';
  hospital: string;
  date: string;
  consent: boolean;
  package?: string;
}

interface ContactFormProps {
  inline?: boolean;
  prefillPackage?: string;
}

export default function ContactForm({ inline = false, prefillPackage }: ContactFormProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    contactMethod: 'whatsapp',
    hospital: '',
    date: '',
    consent: false,
    package: prefillPackage ?? '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync prefillPackage when prop changes (for modal re-use)
  useEffect(() => {
    if (prefillPackage) {
      setFormData((prev) => ({ ...prev, package: prefillPackage }));
    }
  }, [prefillPackage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Заглушка — реальная отправка на Этапе 5
    setStatus('success');
  };

  const formContent = (
    <>
      {status === 'success' ? (
        <div className="bg-sand-50 rounded-2xl p-8 text-center">
          <p className="font-serif text-xl text-brown-800 mb-2">
            Спасибо! Ваша заявка получена!
          </p>
          <p className="text-brown-500 text-sm">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`space-y-5 ${
            inline ? '' : 'bg-white-warm rounded-2xl p-6 md:p-8 shadow-card'
          }`}
        >
          {/* Prefilled package (hidden or visible) */}
          {formData.package && (
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">
                Выбранный пакет
              </label>
              <input
                type="text"
                name="package"
                value={formData.package}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 text-brown-800 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={inline ? 'inline-name' : 'name'}
              className="block text-sm font-medium text-brown-700 mb-1"
            >
              Как к вам обращаться?
            </label>
            <input
              type="text"
              id={inline ? 'inline-name' : 'name'}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-brown-800 placeholder-brown-300 focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400 transition-colors"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-phone' : 'phone'}
              className="block text-sm font-medium text-brown-700 mb-1"
            >
              Телефон
            </label>
            <input
              type="tel"
              id={inline ? 'inline-phone' : 'phone'}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-brown-800 placeholder-brown-300 focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400 transition-colors"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-contactMethod' : 'contactMethod'}
              className="block text-sm font-medium text-brown-700 mb-1"
            >
              Как вам удобнее получить ответ?
            </label>
            <select
              id={inline ? 'inline-contactMethod' : 'contactMethod'}
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-brown-800 focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400 transition-colors"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="phone">Телефон</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-hospital' : 'hospital'}
              className="block text-sm font-medium text-brown-700 mb-1"
            >
              Роддом (номер или город)
            </label>
            <input
              type="text"
              id={inline ? 'inline-hospital' : 'hospital'}
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-brown-800 placeholder-brown-300 focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400 transition-colors"
              placeholder="Например, Роддом №8, Уфа"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-date' : 'date'}
              className="block text-sm font-medium text-brown-700 mb-1"
            >
              Дата выписки (если знаете)
            </label>
            <input
              type="date"
              id={inline ? 'inline-date' : 'date'}
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-brown-800 focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400 transition-colors"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={inline ? 'inline-consent' : 'consent'}
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 rounded border-sand-300 text-terracotta-400 focus:ring-terracotta-400"
            />
            <label
              htmlFor={inline ? 'inline-consent' : 'consent'}
              className="text-sm text-brown-500"
            >
              Я даю своё согласие на обработку персональных данных и
              соглашаюсь с условиями{' '}
              <a href="#" className="text-terracotta-400 hover:underline">
                политики конфиденциальности
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-terracotta-400 hover:bg-terracotta-500 active:bg-terracotta-600 text-white font-medium rounded-full transition-colors duration-300 shadow-warm hover:shadow-warm-lg"
          >
            Оставить заявку
          </button>

          {status === 'error' && (
            <p className="text-sm text-terracotta-500 text-center">
              Упс! Что-то пошло не так при отправке формы.
            </p>
          )}
        </form>
      )}
    </>
  );

  if (inline) {
    return <>{formContent}</>;
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-20 md:py-28 px-6"
    >
      <div className="max-w-xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-brown-800 text-center mb-4">
          Оставить заявку
        </h2>
        <p className="text-brown-500 text-center mb-10">
          Заполните форму, и мы свяжемся с вами в ближайшее время
        </p>
        {formContent}
      </div>
    </section>
  );
}
