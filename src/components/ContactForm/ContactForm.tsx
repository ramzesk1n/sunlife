import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePhoneMask, getTodayDate } from '../../hooks/usePhoneMask';
import { useToast } from '../Toast/ToastProvider';

interface FormData {
  name: string;
  phone: string;
  contactMethod: 'telegram' | 'whatsapp' | 'max' | 'phone';
  hospital: string;
  date: string;
  consent: boolean;
  package?: string;
}

interface ContactFormProps {
  inline?: boolean;
  prefillPackage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ContactForm({ inline = false, prefillPackage, isOpen, onClose }: ContactFormProps) {
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
  const { handlePhoneChange } = usePhoneMask();
  const { showToast } = useToast();
  const todayDate = getTodayDate();

  useEffect(() => {
    if (prefillPackage) {
      setFormData((prev) => ({ ...prev, package: prefillPackage }));
    }
  }, [prefillPackage]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhoneChange(e, (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
    });
  };

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
        showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
        setFormData({
          name: '',
          phone: '',
          contactMethod: 'whatsapp',
          hospital: '',
          date: '',
          consent: false,
          package: '',
        });
        if (onClose) setTimeout(onClose, 1500);
      } else {
        setStatus('error');
        const msg = data.errors?.join(', ') || data.error || 'Ошибка отправки';
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setStatus('error');
      const msg = 'Ошибка сети. Проверьте подключение и попробуйте снова.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  const labelClasses = 'block text-sm font-display font-light text-gold-dark mb-1';
  const inputClasses =
    'w-full px-3 py-2.5 rounded-lg border border-gold-primary/20 bg-cream text-text-dark placeholder-text-light text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-colors';

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
          className={`space-y-3 ${inline ? '' : 'glass rounded-2xl p-4 md:p-6'}`}
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
              <label className="block text-sm font-display font-light text-gold-dark mb-1">
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
              className={labelClasses}
            >
              Как к вам обращаться?
            </label>
            <input
              type="text"
              id={inline ? 'inline-name' : 'name'}
              name="name"
              value={formData.name}
              onChange={handlePhoneInput}
              required
              min={todayDate}
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-phone' : 'phone'}
              className={labelClasses}
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
              className={labelClasses}
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
              <option value="max">Max</option>
              <option value="phone">Телефон</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={inline ? 'inline-hospital' : 'hospital'}
              className={labelClasses}
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
              className={labelClasses}
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
              className="text-sm text-text-muted leading-snug"
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
            className="w-full py-3 border border-gold-primary text-gold-primary font-display font-light uppercase tracking-wider rounded-xl hover:bg-gold-primary hover:text-cream transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

  if (isOpen === true) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Форма заявки"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div className="absolute inset-0 bg-text-dark/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass rounded-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-cream-2 hover:bg-cream-dark text-gold-dark transition-colors z-10"
            aria-label="Закрыть форму"
          >
            ✕
          </button>
          <div className="p-4 md:p-6">
            <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 mb-1 uppercase tracking-wider">
              Оставить заявку
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Заполните форму, и мы свяжемся с вами в ближайшее время
            </p>
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  if (isOpen === false) {
    return null;
  }

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
