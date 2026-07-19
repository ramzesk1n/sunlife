import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import metaData from './content/meta.json';

/* Components */
import Header from './components/Header/Header';
import CookieBanner from './components/CookieBanner/CookieBanner';
import Hero from './components/Hero/Hero';
import Benefits from './components/Benefits/Benefits';
import Footer from './components/Footer/Footer';
import MobileBottomBar from './components/MobileBottomBar/MobileBottomBar';
import InlineCta from './components/InlineCta/InlineCta';
import ToastProvider from './components/Toast/ToastProvider';
import BackToTop from './components/BackToTop/BackToTop';
import SchemaOrg from './components/SchemaOrg/SchemaOrg';
import { SkeletonCard } from './components/Skeleton/Skeleton';

/* Lazy loaded components for code splitting */
const ExperienceSteps = lazy(() => import('./components/ExperienceSteps/ExperienceSteps'));
const Gallery = lazy(() => import('./components/Gallery/Gallery'));
const PricingCards = lazy(() => import('./components/PricingCards/PricingCards'));
const Testimonials = lazy(() => import('./components/Testimonials/Testimonials'));
const FAQ = lazy(() => import('./components/FAQ/FAQ'));
const TeamSlider = lazy(() => import('./components/TeamSlider/TeamSlider'));
const Geography = lazy(() => import('./components/Geography/Geography'));

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
const PartnershipPopupForm = lazy(() => import('./components/PartnershipPopupForm/PartnershipPopupForm'));

/* Lazy loaded pages */
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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

function SectionSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/* Page wrappers */
function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <ExperienceSteps />
        </Suspense>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <Gallery />
        </Suspense>
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cream">
          <div className="max-w-4xl mx-auto">
            <InlineCta
              page="home"
              title="Остались вопросы?"
              subtitle="Получите персональную консультацию по съёмке выписки из роддома"
            />
          </div>
        </section>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <PricingCards />
        </Suspense>
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cream">
          <div className="max-w-4xl mx-auto">
            <InlineCta
              page="home"
              title="Не нашли подходящий пакет?"
              subtitle="Напишите нам — подберём оптимальное решение под ваши пожелания"
            />
          </div>
        </section>
        <Suspense fallback={<SectionSkeleton count={3} />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <TeamSlider />
        </Suspense>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <Geography />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function PricePage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <PricingCards />
        </Suspense>
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cream">
          <div className="max-w-4xl mx-auto">
            <InlineCta
              page="price"
              title="Расскажем о съёмке в вашем роддоме"
              subtitle="Оставьте заявку — мы подскажем, какой пакет подойдёт именно вам"
            />
          </div>
        </section>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <Geography />
        </Suspense>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <FAQ />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function GalleryPageRoute() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <GalleryPage />
        </Suspense>
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cream">
          <div className="max-w-4xl mx-auto">
            <InlineCta
              page="galery"
              title="Хотите такие же фото?"
              subtitle="Забронируйте съёмку выписки из роддома — оставьте заявку прямо сейчас"
            />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function PartnershipPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <Suspense fallback={<PageLoader />}>
      <Header />
      <main>
        <PartnershipHero onOpenForm={() => setIsPopupOpen(true)} />
        <PartnershipAbout />
        <PartnershipOffers />
        <PartnershipTestimonial />
        <PartnershipBeforeAfter />
        <PartnershipPricing />
        <PartnershipExamples />
        <PartnershipFAQ />
        <PartnershipTeam />
        <PartnershipGallery />
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-cream-2">
          <div className="max-w-4xl mx-auto">
            <InlineCta
              page="partnership"
              title="Обсудим условия для вашего роддома"
              subtitle="Оставьте заявку — мы расскажем, как начать сотрудничество с фотослужбой «Санлайф»"
            />
          </div>
        </section>
      </main>
      <Footer />
      <PartnershipPopupForm isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <MobileBottomBar />
    </Suspense>
  );
}

function PrivacyPageWrapper() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <PrivacyPage />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function TermsPageWrapper() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <TermsPage />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function SitemapPageWrapper() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <SitemapPage />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function ContactsPageRoute() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionSkeleton count={1} />}>
          <ContactsPage />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomBar />
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
    <ToastProvider>
      <SeoUpdater />
      <SchemaOrg pathname={location.pathname} />
      <CookieBanner />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/price" element={<PricePage />} />
        <Route path="/galery" element={<GalleryPageRoute />} />
        <Route path="/partnership" element={<PartnershipPage />} />
        <Route path="/contacts" element={<ContactsPageRoute />} />
        <Route path="/privacy" element={<PrivacyPageWrapper />} />
        <Route path="/terms" element={<TermsPageWrapper />} />
        <Route path="/sitemap" element={<SitemapPageWrapper />} />
        <Route path="*" element={
        <>
          <Header />
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
          <Footer />
          <MobileBottomBar />
        </>
      } />
      </Routes>
      <BackToTop />
    </ToastProvider>
  );
}
