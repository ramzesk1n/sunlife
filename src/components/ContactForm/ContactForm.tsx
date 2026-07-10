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
    setStatus('success');
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl border border-gold-primary/20 bg-cream text-text-dark placeholder-text-light focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-colors';

  const formContent = (
    <>
      {status === 'success' ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-display text-xl text-gold-primary-80 mb-2 uppercase tracking-wider">
            Спасибо! Ваша заявка получена!
          </p>
          <p className="text-text-muted text-sm">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`space-y-5 ${inline ? '' : 'glass rounded-2xl p-6 md:p-8'}`}
        >
          {formData.package && (
            <div>
              <label className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1">
                Выбранный пакет
              </label>
              <input
                type="text"
                name="package"
                value={formData.package}
                readOnly
                className={`${inputClasses} bg-gold-pale cursor-not-allowed`}
              />
            </div>
          )}

          <div>
            <label
              htmlFor={inline ? 'inline-name' : 'name'}
              className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1"
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
              className={inputClasses}
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-phone' : 'phone'}
              className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1"
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
              className={inputClasses}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-contactMethod' : 'contactMethod'}
              className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1"
            >
              Как вам удобнее получить ответ?
            </label>
            <select
              id={inline ? 'inline-contactMethod' : 'contactMethod'}
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="phone">Телефон</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-hospital' : 'hospital'}
              className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1"
            >
              Роддом (номер или город)
            </label>
            <input
              type="text"
              id={inline ? 'inline-hospital' : 'hospital'}
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Например, Роддом №8, Уфа"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-date' : 'date'}
              className="block text-sm font-display font-semibold text-gold-dark uppercase tracking-wider mb-1"
            >
              Дата выписки (если знаете)
            </label>
            <input
              type="date"
              id={inline ? 'inline-date' : 'date'}
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClasses}
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
              className="mt-1 w-4 h-4 rounded border-gold-primary/30 text-gold-primary focus:ring-gold-primary/30"
            />
            <label
              htmlFor={inline ? 'inline-consent' : 'consent'}
              className="text-sm text-text-muted"
            >
              Я даю своё согласие на обработку персональных данных и
              соглашаюсь с условиями{' '}
              <a href="#" className="text-gold-primary hover:underline">
                политики конфиденциальности
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 border border-gold-primary text-gold-primary font-display font-semibold uppercase tracking-wider rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300"
          >
            Оставить заявку
          </button>

          {status === 'error' && (
            <p className="text-sm text-red-600 text-center">
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
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-gold-primary-80 text-center mb-4 uppercase tracking-wider">
          Оставить заявку
        </h2>
        <p className="text-text-muted text-center mb-10">
          Заполните форму, и мы свяжемся с вами в ближайшее время
        </p>
        {formContent}
      </div>
    </section>
  );
}
