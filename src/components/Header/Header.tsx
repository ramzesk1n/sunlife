import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import siteData from '../../content/site.json';
import ContactForm from '../ContactForm/ContactForm';
const PartnershipPopupForm = lazy(() => import('../PartnershipPopupForm/PartnershipPopupForm'));

const navLinks = [
  { label: 'Услуги', href: '/price' },
  { label: 'Портфолио', href: '/galery' },
  { label: 'Партнёрство', href: '/partnership' },
  { label: 'Контакты', href: '/contacts' },
];

const socialLinks = [
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

const PAGE_KEY_MAP: Record<string, string> = {
  '/': 'home',
  '/price': 'price',
  '/galery': 'galery',
  '/partnership': 'partnership',
  '/contacts': 'contacts',
  '/privacy': 'privacy',
};

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);

  const pageKey = PAGE_KEY_MAP[location.pathname] || 'home';
  const cta = siteData.cta[pageKey as keyof typeof siteData.cta] || siteData.cta.home;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <nav
        className={`mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${
          isScrolled
            ? 'bg-white/70 border border-gold-primary/20 shadow-soft'
            : 'bg-white/40 border border-white/30'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(1.25rem)',
          backdropFilter: 'blur(1.25rem)',
        }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/images/sunlife_logo.webp"
                alt=""
                className="w-full h-full object-contain p-1"
                loading="eager"
                width="56"
                height="56"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs md:text-sm text-gold-dark uppercase tracking-[0.2em] leading-tight">
                фотослужба
              </p>
              <p className="text-base md:text-lg font-display font-light text-gold-primary uppercase tracking-wider leading-tight">
                САН ЛАЙФ
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-2xl text-sm md:text-base font-display uppercase tracking-[0.2em] transition-all duration-300 ${
                  location.pathname === link.href
                    ? 'bg-gold-primary/15 text-gold-dark shadow-gold'
                    : 'text-gold-dark hover:bg-white/60 hover:shadow-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social + Mobile toggle */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-cream-2 border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-cream hover:border-gold-primary transition-all duration-300"
              >
                <img
                  src={social.src}
                  alt={social.label}
                  className="w-5 h-5"
                  loading="lazy"
                />
              </a>
            ))}

            {/* Mobile menu button */}
            {/* Desktop CTA */}
            {cta.form !== 'home' && (
              <button
                type="button"
                onClick={() => {
                  if (cta.form === 'partnership') {
                    setIsPartnershipOpen(true);
                  } else {
                    setIsContactOpen(true);
                  }
                }}
                className="hidden md:inline-flex items-center justify-center px-5 py-2.5 bg-gold-primary text-cream text-sm font-display font-light uppercase tracking-wider rounded-xl hover:bg-gold-dark transition-colors duration-300"
              >
                {cta.label}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-xl bg-cream-2 border border-gold-primary/30 flex items-center justify-center text-gold-primary"
              aria-label="Открыть меню"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-gold-primary/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-xl text-base font-display uppercase tracking-[0.2em] transition-all duration-300 ${
                    location.pathname === link.href
                      ? 'bg-gold-primary/15 text-gold-dark'
                      : 'text-gold-dark hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <Suspense fallback={null}>
        <PartnershipPopupForm isOpen={isPartnershipOpen} onClose={() => setIsPartnershipOpen(false)} />
      </Suspense>
    </header>
  );
}
