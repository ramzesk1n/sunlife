import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer
      ref={footerRef}
      className="bg-cream-2 border-t border-gold-primary/10 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Бренд */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full border border-gold-primary/40 flex items-center justify-center text-gold-primary bg-cream">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2" />
                  <path d="M12 21v2" />
                  <path d="M4.22 4.22l1.42 1.42" />
                  <path d="M18.36 18.36l1.42 1.42" />
                </svg>
              </div>
              <div>
                <p className="text-[0.625rem] text-gold-dark uppercase tracking-[0.2em]">фотослужба</p>
                <p className="text-sm font-display font-semibold text-gold-primary uppercase tracking-wider">САН ЛАЙФ</p>
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Профессиональная фотосъёмка выписки новорождённых
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-display font-semibold text-gold-dark uppercase tracking-wider text-sm mb-4">
              Навигация
            </h4>
            <nav className="space-y-2">
              <Link to="/price" className="block text-text-muted hover:text-gold-primary text-sm transition-colors uppercase tracking-wider">
                Цены
              </Link>
              <Link to="/galery" className="block text-text-muted hover:text-gold-primary text-sm transition-colors uppercase tracking-wider">
                Портфолио
              </Link>
              <Link to="/partnership" className="block text-text-muted hover:text-gold-primary text-sm transition-colors uppercase tracking-wider">
                Партнёрство
              </Link>
              <a href="#" className="block text-text-muted hover:text-gold-primary text-sm transition-colors uppercase tracking-wider">
                Политика конфиденциальности
              </a>
            </nav>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-display font-semibold text-gold-dark uppercase tracking-wider text-sm mb-4">
              Контакты
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-text-muted">+7 (999) 123-45-67</p>
              <p className="text-text-muted">hello@sunlife-ufa.ru</p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://wa.me/79279363606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-cream border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  </svg>
                </a>
                <a
                  href="https://t.me/TigerSax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-cream border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream transition-all duration-300"
                  aria-label="Telegram"
                >
                  <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                  </svg>
                </a>
                <a
                  href="https://vk.com/roddomafoto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-cream border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream transition-all duration-300"
                  aria-label="VK"
                >
                  <svg className="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.624 10.857 4 8.673 4 8.231c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold-primary/10 pt-6 text-center">
          <p className="text-text-light text-xs">
            © 2025 Студия Рамзеса Мифтахова. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
