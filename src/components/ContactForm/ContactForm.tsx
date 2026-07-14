import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/send-form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.errors?.join(', ') || data.error || 'Ошибка отправки');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Ошибка сети. Проверьте подключение и попробуйте снова.');
    }
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl border border-gold-primary/20 bg-cream text-text-dark placeholder-text-light focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-colors';

  const formContent = (
    <>
      {status === 'success' ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-display text-2xl text-gold-primary-80 mb-2 uppercase tracking-wider">
            Спасибо! Ваша заявка получена!
          </p>
          <p className="text-text-muted text-base">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`space-y-5 ${inline ? '' : 'glass rounded-2xl p-6 md:p-8'}`}
        >
          {/* Honeypot - hidden from users, bots will fill it */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
            value=""
            onChange={() => {}}
          />

          {formData.package && (
            <div>
              <label className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1">
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
              className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1"
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
              className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1"
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
              placeholder="+7 (927) 936-36-06"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-contactMethod' : 'contactMethod'}
              className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1"
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
              className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1"
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
              className="block text-base font-display font-light text-gold-dark uppercase tracking-wider mb-1"
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
              className="text-base text-text-muted"
            >
              Я согласен(на) на обработку моих персональных данных (имя, телефон) в целях обработки заявки на фотосъёмку и связи со мной в соответствии с{' '}
              <Link to="/privacy" className="text-gold-primary hover:underline" target="_blank">
                Политикой обработки персональных данных
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 border border-gold-primary text-gold-primary font-display font-light uppercase tracking-wider rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Отправка...' : 'Оставить заявку'}
          </button>

          {status === 'error' && (
            <p className="text-sm text-red-600 text-center">
              {errorMessage || 'Упс! Что-то пошло не так при отправке формы.'}
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
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider">
          Оставить заявку
        </h2>
        <p className="text-text-muted text-center text-base md:text-lg mb-10">
          Заполните форму, и мы свяжемся с вами в ближайшее время
        </p>
        {formContent}
      </div>
    </section>
  );
}
