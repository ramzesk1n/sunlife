import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import Geography from '../components/Geography/Geography';
import Footer from '../components/Footer/Footer';
import ContactForm from '../components/ContactForm/ContactForm';
import siteData from '../content/site.json';

export default function ContactsPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Телефон',
      value: '+7 (927) 936-36-06',
      href: 'tel:+79279363606',
      description: 'Ежедневно с 8:00 до 21:00',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'hello@sunlife-ufa.ru',
      href: 'mailto:hello@sunlife-ufa.ru',
      description: 'Ответим в течение 2 часов',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Адрес',
      value: 'г. Уфа, ул. Ленина, 70',
      href: 'https://yandex.ru/maps/-/CDXVfYJ1',
      description: 'Офис и фотостудия',
    },
  ];

  const { whatsapp, telegram, vk } = siteData;

  const socials = [
    {
      name: 'WhatsApp',
      href: whatsapp.href,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.439 9.884-9.885 9.884m8.413-18.3A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: telegram.href,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
    },
    {
      name: 'VK',
      href: vk.href,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.946 4 8.522c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.814-.542 1.27-1.422 2.176-3.61 2.176-3.61.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream-2 border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold-dark hover:text-gold-primary transition-colors text-sm font-display uppercase tracking-wider mb-8"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            На главную
          </Link>

          <motion.h1
            ref={sectionRef}
            className="font-display text-3xl md:text-4xl lg:text-5xl text-gold-primary-80 uppercase tracking-wider mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Контакты
          </motion.h1>

          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto">
            Свяжитесь с нами любым удобным способом. Мы всегда на связи и рады помочь!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 uppercase tracking-wider mb-8">
              Наши контакты
            </h2>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-4 p-4 rounded-2xl glass hover:shadow-glass transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary flex-shrink-0 group-hover:bg-gold-primary group-hover:text-cream transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-text-muted text-sm mb-1">{item.label}</p>
                    <p className="text-text-dark text-lg font-medium group-hover:text-gold-primary transition-colors">
                      {item.value}
                    </p>
                    <p className="text-text-light text-sm mt-1">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Socials */}
            <div className="mt-10">
              <h3 className="font-display text-lg text-gold-dark uppercase tracking-wider mb-4">
                Мы в соцсетях
              </h3>
              <div className="flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream transition-all duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-10 p-6 rounded-2xl glass">
              <h3 className="font-display text-lg text-gold-dark uppercase tracking-wider mb-4">
                Режим работы
              </h3>
              <div className="space-y-2 text-text-dark">
                <div className="flex justify-between">
                  <span>Понедельник — Пятница</span>
                  <span className="font-medium">8:00 — 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Суббота</span>
                  <span className="font-medium">9:00 — 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Воскресенье</span>
                  <span className="font-medium">10:00 — 18:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map + Form */}
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 uppercase tracking-wider mb-8">
              Как нас найти
            </h2>

            {/* Yandex Map iframe */}
            <div className="rounded-2xl overflow-hidden border border-gold-primary/10 shadow-card mb-8 aspect-[4/3]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?z=16&ol=biz&oid=1792274489"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
                title="Карта проезда"
              />
            </div>

            {/* Quick Form */}
            <div className="p-6 rounded-2xl glass">
              <h3 className="font-display text-lg text-gold-dark uppercase tracking-wider mb-4">
                Быстрая связь
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Оставьте номер — мы перезвоним в течение 15 минут
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="block w-full py-4 bg-gold-primary text-cream text-center font-display uppercase tracking-wider rounded-2xl hover:bg-gold-dark transition-colors"
              >
                Заказать звонок
              </button>
              <p className="text-text-light text-xs text-center mt-3">
                Или напишите в WhatsApp / Telegram — ответим мгновенно
              </p>
            </div>
          </div>
        </div>

        {/* Requisites */}
        <div className="mt-16 pt-16 border-t border-gold-primary/10">
          <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 uppercase tracking-wider mb-8 text-center">
            Реквизиты
          </h2>
          <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl glass">
            <div className="space-y-3 text-text-dark text-sm md:text-base">
              <div className="flex justify-between border-b border-gold-primary/10 pb-2">
                <span className="text-text-muted">Полное наименование</span>
                <span className="font-medium text-right">ИП Чанышев Тагир Амирович</span>
              </div>
              <div className="flex justify-between border-b border-gold-primary/10 pb-2">
                <span className="text-text-muted">ИНН</span>
                <span className="font-medium">027812301688</span>
              </div>
              <div className="flex justify-between border-b border-gold-primary/10 pb-2">
                <span className="text-text-muted">ОГРНИП</span>
                <span className="font-medium">313028000070599</span>
              </div>
              <div className="flex justify-between border-b border-gold-primary/10 pb-2">
                <span className="text-text-muted">Юридический адрес</span>
                <span className="font-medium text-right">РБ, г. Уфа, ул. Ленина, 70</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span className="font-medium">hello@sunlife-ufa.ru</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Geography />
      <Footer />
      <ContactForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
