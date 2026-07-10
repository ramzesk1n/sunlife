import { useRef } from 'react';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer
      ref={footerRef}
      className="bg-brown-800 text-sand-200 py-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Бренд */}
          <div>
            <h3 className="font-serif text-xl text-white mb-2">
              САН ЛАЙФ фотослужба
            </h3>
            <p className="text-sand-300 text-sm leading-relaxed">
              Профессиональная фотосъёмка выписки новорождённых
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-medium text-white mb-3">Навигация</h4>
            <nav className="space-y-2">
              <a
                href="/price"
                className="block text-sand-300 hover:text-white text-sm transition-colors"
              >
                Цены
              </a>
              <a
                href="/galery"
                className="block text-sand-300 hover:text-white text-sm transition-colors"
              >
                Портфолио
              </a>
              <a
                href="/partnership"
                className="block text-sand-300 hover:text-white text-sm transition-colors"
              >
                Партнёрство
              </a>
              <a
                href="#"
                className="block text-sand-300 hover:text-white text-sm transition-colors"
              >
                Политика конфиденциальности
              </a>
            </nav>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-medium text-white mb-3">Контакты</h4>
            <div className="space-y-2 text-sm">
              <p className="text-sand-300">+7 (999) 123-45-67</p>
              <p className="text-sand-300">hello@sunlife-ufa.ru</p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://wa.me/79279363606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-300 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  WA
                </a>
                <a
                  href="https://t.me/TigerSax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-300 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  TG
                </a>
                <a
                  href="https://vk.com/roddomafoto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-300 hover:text-white transition-colors"
                  aria-label="VK"
                >
                  VK
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brown-600 pt-6 text-center">
          <p className="text-sand-400 text-xs">
            © 2025 Студия Рамзеса Мифтахова. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
