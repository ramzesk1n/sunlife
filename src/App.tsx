import ContactsPage from './pages/ContactsPage';import TeamSlider from './components/TeamSlider/TeamSlider';import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import metaData from './content/meta.json';

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
import Footer from './components/Footer/Footer';
import PrivacyPage from './pages/PrivacyPage';

/* Lazy loaded components for code splitting */
const PartnershipHero = lazy(() => import('./components/PartnershipHero/PartnershipHero'));
const PartnershipAbout = lazy(() => import('./components/PartnershipAbout/PartnershipAbout'));
const PartnershipOffers = lazy(() => import('./components/PartnershipOffers/PartnershipOffers'));
const PartnershipBeforeAfter = lazy(() => import('./components/PartnershipBeforeAfter/PartnershipBeforeAfter'));
const PartnershipTestimonial = lazy(() => import('./components/PartnershipTestimonial/PartnershipTestimonial'));
const PartnershipPricing = lazy(() => import('./components/PartnershipPricing/PartnershipPricing'));
const PartnershipFAQ = lazy(() => import('./components/PartnershipFAQ/PartnershipFAQ'));
const PartnershipTeam = lazy(() => import('./components/PartnershipTeam/PartnershipTeam'));
const PartnershipGallery = lazy(() => import('./components/PartnershipGallery/PartnershipGallery'));
const PartnershipExamples = lazy(() => import('./components/PartnershipExamples/PartnershipExamples'));

/* Loading fallback */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-primary/20 border-t-gold-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted font-display">Загрузка...</p>
      </div>
    </div>
  );
}

/* Page wrappers */
function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Benefits />
      <ExperienceSteps />
      <Gallery />
      <Testimonials />
      <FAQ />
      <TeamSlider />
      <Geography />
      <Footer />
    </>
  );
}

function PricePage() {
  return (
    <>
      <Header />
      <PricingCards />
      <Geography />
      <FAQ />
      <Footer />
    </>
  );
}

function GalleryPage() {
  return (
    <>
      <Header />
      <Gallery />
      <Footer />
    </>
  );
}

function PartnershipPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Header />
      <PartnershipHero onOpenForm={() => {}} />
      <PartnershipAbout />
      <PartnershipOffers />
      <PartnershipTestimonial />
      <PartnershipBeforeAfter />
      <PartnershipPricing />
      <PartnershipExamples />
      <PartnershipFAQ />
      <PartnershipTeam />
      <PartnershipGallery />
      <Footer />
    </Suspense>
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
    const meta = metaData.pages.find((p) => p.path === location.pathname) ?? metaData.pages[0];
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
    updateMeta('og:url', meta.canonical);
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
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/price" element={<PricePage />} />
        <Route path="/galery" element={<GalleryPage />} />
        <Route path="/partnership" element={<PartnershipPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/privacy" element={<PrivacyPageWrapper />} />
      </Routes>
    </>
  );
}
