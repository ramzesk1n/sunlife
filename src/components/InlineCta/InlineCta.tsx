import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import siteData from '../../content/site.json';
import ContactForm from '../ContactForm/ContactForm';
const PartnershipPopupForm = lazy(() => import('../PartnershipPopupForm/PartnershipPopupForm'));

interface InlineCtaProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'compact';
  page?: 'home' | 'price' | 'galery' | 'partnership' | 'contacts' | 'privacy';
}

export default function InlineCta({ title, subtitle, variant = 'default', page = 'home' }: InlineCtaProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const cta = siteData.cta[page] || siteData.cta.home;
  const isPartnership = cta.form === 'partnership';
  const isHome = cta.form === 'home';

  const handlePrimaryClick = () => {
    if (isHome) return;
    if (isPartnership) {
      setIsPartnershipOpen(true);
    } else {
      setIsContactOpen(true);
    }
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const menuItems = [
    { icon: 'whatsapp', label: 'WhatsApp', href: siteData.whatsapp.href },
    { icon: 'telegram', label: 'Telegram', href: siteData.telegram.href },
    { icon: 'vk', label: 'VK', href: siteData.vk.href },
    { icon: 'max', label: 'Max', href: siteData.max.href },
  ];

  return (
    <>
      <div
        ref={sectionRef}
        className={`glass rounded-2xl text-center transition-all duration-500 ease-out ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${variant === 'compact' ? 'p-6 md:p-8' : 'p-8 md:p-12'}`}
      >
        <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-light text-gold-primary-80 uppercase tracking-wider mb-3">
          {title}
        </h3>
        {subtitle && (
          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto mb-6">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          {isHome ? (
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-4 bg-gold-primary text-cream font-display font-light uppercase tracking-wider rounded-2xl hover:bg-gold-dark transition-colors duration-300 inline-flex items-center justify-center"
            >
              {cta.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="w-full sm:w-auto px-8 py-4 bg-gold-primary text-cream font-display font-light uppercase tracking-wider rounded-2xl hover:bg-gold-dark transition-colors duration-300 inline-flex items-center justify-center"
            >
              {cta.label}
            </button>
          )}

          {/* Write button with popup menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full sm:w-auto px-8 py-4 border border-gold-primary text-gold-primary font-display font-light uppercase tracking-wider rounded-2xl hover:bg-gold-primary hover:text-cream transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Написать
            </button>

            {isMenuOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass rounded-xl p-2 shadow-gold z-20 min-w-[180px] animate-fade-in-up">
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold-primary/10 transition-colors text-sm text-text-dark"
                    >
                      {item.icon === 'whatsapp' && (
                        <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      )}
                      {item.icon === 'telegram' && (
                        <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      )}
                      {item.icon === 'vk' && (
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.946 4 8.522c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.814-.542 1.27-1.422 2.176-3.61 2.176-3.61.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                        </svg>
                      )}
                      {item.icon === 'max' && (
                        <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3C6.5 3 2 7.05 2 12c0 2.45 1.1 4.7 2.9 6.3L4 22l3.95-1.65c1.25.5 2.6.75 4.05.75 5.5 0 10-4.05 10-9S17.5 3 12 3Z" />
                          <path d="M7 15V9.5l2.5 3.5 2.5-3.5V15" />
                          <path d="M14.25 15l2-5.5 2 5.5" />
                          <path d="M14.9 13.25h2.7" />
                        </svg>
                      )}
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <Suspense fallback={null}>
        <PartnershipPopupForm isOpen={isPartnershipOpen} onClose={() => setIsPartnershipOpen(false)} />
      </Suspense>
    </>
  );
}
