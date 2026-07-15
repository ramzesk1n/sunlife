import { useRef } from 'react';
import { Link } from 'react-router-dom';

const socialLinks = [
  {
    href: 'tel:+79279363606',
    label: 'Позвонить',
    src: '/images/whatsapp.svg',
  },
  {
    href: 'https://wa.me/79279363606',
    label: 'WhatsApp',
    src: '/images/whatsapp.svg',
  },
  {
    href: 'https://telegram.me/TigerSax',
    label: 'Telegram',
    src: '/images/telegram.svg',
  },
  {
    href: 'https://vk.com/roddomafoto',
    label: 'VK',
    src: '/images/vk.svg',
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer
      ref={footerRef}
      className="bg-cream-2 border-t border-gold-primary/10 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Бренд */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src="/images/sunlife_logo.webp"
                  alt=""
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                  width="56"
                  height="56"
                />
              </div>
              <div>
                <p className="text-xs text-gold-dark uppercase tracking-[0.2em]">фотослужба</p>
                <p className="text-sm font-display font-light text-gold-primary uppercase tracking-wider">САН ЛАЙФ</p>
              </div>
            </div>
            <p className="text-text-muted text-base leading-relaxed">
              Профессиональная фотосъёмка выписки новорождённых
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-display font-light text-gold-dark uppercase tracking-wider text-base mb-4">
              Навигация
            </h4>
            <nav className="space-y-2">
              <Link to="/price" className="block text-text-muted hover:text-gold-primary text-base transition-colors uppercase tracking-wider">
                Цены
              </Link>
              <Link to="/galery" className="block text-text-muted hover:text-gold-primary text-base transition-colors uppercase tracking-wider">
                Портфолио
              </Link>
              <Link to="/partnership" className="block text-text-muted hover:text-gold-primary text-base transition-colors uppercase tracking-wider">
                Партнёрство
              </Link>
              <Link to="/privacy" className="block text-text-muted hover:text-gold-primary text-base transition-colors uppercase tracking-wider">
                Политика конфиденциальности
              </Link>
            </nav>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-display font-light text-gold-dark uppercase tracking-wider text-base mb-4">
              Контакты
            </h4>
            <div className="space-y-2 text-base">
              <a href="tel:+79279363606" className="block text-text-muted hover:text-gold-primary transition-colors">
                +7 (927) 936-36-06
              </a>
              <p className="text-text-muted">hello@sunlife-ufa.ru</p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('tel:') ? undefined : '_blank'}
                    rel={social.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                    className="w-9 h-9 rounded-xl bg-cream border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream transition-all duration-300"
                    aria-label={social.label}
                  >
                    <img
                      src={social.src}
                      alt={social.label}
                      className="w-[1.125rem] h-[1.125rem]"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold-primary/10 pt-6 text-center">
          <p className="text-text-light text-sm">
            © 2025–2026 Студия дизайна Рамзеса Мифтахова. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
