import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { getMetaByPath } from './content/meta';

/* Components */
import Header from './components/Header/Header';
import CookieBanner from './components/CookieBanner/CookieBanner';
import Hero from './components/Hero/Hero';
import Benefits from './components/Benefits/Benefits';
import ExperienceSteps from './components/ExperienceSteps/ExperienceSteps';
import Geography from './components/Geography/Geography';
import PricingCards from './components/PricingCards/PricingCards';
import Gallery from './components/Gallery/Gallery';
import Testimonials from './components/Testimonials/Testimonials';
import FAQ from './components/FAQ/FAQ';
import ContactForm from './components/ContactForm/ContactForm';
import Footer from './components/Footer/Footer';
import PartnershipHero from './components/PartnershipHero/PartnershipHero';
import PartnershipAbout from './components/PartnershipAbout/PartnershipAbout';
import PartnershipOffers from './components/PartnershipOffers/PartnershipOffers';
import PartnershipBeforeAfter from './components/PartnershipBeforeAfter/PartnershipBeforeAfter';
import PartnershipPricing from './components/PartnershipPricing/PartnershipPricing';
import PartnershipFAQ from './components/PartnershipFAQ/PartnershipFAQ';
import PartnershipTeam from './components/PartnershipTeam/PartnershipTeam';
import PartnershipGallery from './components/PartnershipGallery/PartnershipGallery';
import PrivacyPage from './pages/PrivacyPage';

/* Page wrappers */
function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Benefits />
      <ExperienceSteps />
      <Geography />
      <PricingCards />
      <Gallery />
      <Testimonials />
      <FAQ />
      <ContactForm />
      <Footer />
    </>
  );
}

function PricePage() {
  return (
    <>
      <Header />
      <PricingCards />
      <FAQ />
      <ContactForm />
      <Footer />
    </>
  );
}

function GalleryPage() {
  return (
    <>
      <Header />
      <Gallery />
      <ContactForm />
      <Footer />
    </>
  );
}

function PartnershipPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const openFormModal = useCallback(() => setIsFormModalOpen(true), []);
  const closeFormModal = useCallback(() => setIsFormModalOpen(false), []);

  return (
    <>
      <Header />
      <PartnershipHero onOpenForm={openFormModal} />
      <PartnershipAbout />
      <PartnershipOffers />
      <PartnershipBeforeAfter />
      <PartnershipPricing />
      <PartnershipFAQ />
      <PartnershipTeam />
      <PartnershipGallery />
      <ContactForm />
      <Footer />

      {/* Partnership CTA modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Форма заявки"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFormModal();
          }}
        >
          <div className="absolute inset-0 bg-text-dark/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl">
            <button
              type="button"
              onClick={closeFormModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-cream-2 hover:bg-cream-dark text-gold-dark transition-colors z-10"
              aria-label="Закрыть форму"
            >
              ✕
            </button>
            <div className="p-6 md:p-8">
              <h2 className="font-display text-2xl md:text-3xl text-gold-primary-80 mb-2 uppercase tracking-wider">
                Стать партнёром
              </h2>
              <p className="text-text-muted mb-6">
                Заполните форму, и мы свяжемся с вами
              </p>
              <ContactForm inline />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PrivacyPageWrapper() {
  return (
    <>
      <Header />
      <PrivacyPage />
      <Footer />
    </>
  );
}

/* SEO updater */
function SeoUpdater() {
  const location = useLocation();

  useEffect(() => {
    const meta = getMetaByPath(location.pathname);
    document.title = meta.title;

    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[name="${name}"], meta[property="${name}"]`
      );
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    updateMeta('description', meta.description);
    updateMeta('og:title', meta.ogTitle);
    updateMeta('og:description', meta.ogDescription);
    updateMeta('og:image', meta.ogImage);
    updateMeta('og:url', `${meta.canonical}`);
    updateMeta('og:type', 'website');

    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

/* App */
export default function App() {
  const location = useLocation();

  return (
    <>
      <SeoUpdater />
      <CookieBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/galery" element={<GalleryPage />} />
          <Route path="/partnership" element={<PartnershipPage />} />
          <Route path="/privacy" element={<PrivacyPageWrapper />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
