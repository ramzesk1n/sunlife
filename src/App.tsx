import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { getMetaByPath } from './content/meta';

/* Components */
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

/* Page wrappers */
function HomePage() {
  return (
    <>
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
      <Gallery />
      <ContactForm />
      <Footer />
    </>
  );
}

function PartnershipPage() {
  return (
    <>
      <Benefits />
      <ContactForm />
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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/galery" element={<GalleryPage />} />
          <Route path="/partnership" element={<PartnershipPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
